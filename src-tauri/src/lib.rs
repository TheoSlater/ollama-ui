use std::process::Command;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, Window};

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaModel {
    pub name: String,
    pub id: String,
    pub size: String,
    pub modified: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PullProgress {
    pub model: String,
    pub status: String,
    pub progress: Option<f32>,
    pub completed: bool,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub role: String, // "user", "assistant", "system"
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TerminalOutput {
    pub command: String,
    pub output: String,
    pub timestamp: String,
    pub exit_code: Option<i32>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn list_models() -> Result<Vec<OllamaModel>, String> {
    let output = Command::new("ollama")
        .arg("list")
        .output()
        .map_err(|e| format!("Failed to execute ollama list: {}", e))?;

    if !output.status.success() {
        return Err(format!("ollama list failed: {}", String::from_utf8_lossy(&output.stderr)));
    }

    let output_str = String::from_utf8_lossy(&output.stdout);
    let mut models = Vec::new();

    for line in output_str.lines().skip(1) { // Skip header line
        if line.trim().is_empty() {
            continue;
        }
        
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 4 {
            models.push(OllamaModel {
                name: parts[0].to_string(),
                id: parts[1].to_string(),
                size: format!("{} {}", parts[2], parts[3]),
                modified: parts[4..].join(" "),
            });
        }
    }

    Ok(models)
}

#[tauri::command]
async fn check_ollama_status() -> Result<bool, String> {
    let output = Command::new("ollama")
        .arg("list")
        .output()
        .map_err(|_| "Ollama not found or not running".to_string())?;

    Ok(output.status.success())
}

#[tauri::command]
async fn pull_model(window: Window, model_name: String) -> Result<(), String> {
    let window_clone = window.clone();
    let model_name_clone = model_name.clone();
    
    tauri::async_runtime::spawn(async move {
        // Emit initial progress
        let _ = window_clone.emit("pull-progress", PullProgress {
            model: model_name_clone.clone(),
            status: "Starting pull...".to_string(),
            progress: Some(0.0),
            completed: false,
            error: None,
        });

        // Also emit to terminal
        let _ = window_clone.emit("terminal-output", TerminalOutput {
            command: format!("ollama pull {}", model_name_clone),
            output: format!("$ ollama pull {}", model_name_clone),
            timestamp: chrono::Utc::now().to_rfc3339(),
            exit_code: None,
        });

        let output = Command::new("ollama")
            .arg("pull")
            .arg(&model_name_clone)
            .output();

        match output {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                
                // Emit terminal output for both stdout and stderr
                if !stdout.is_empty() {
                    let _ = window_clone.emit("terminal-output", TerminalOutput {
                        command: format!("ollama pull {}", model_name_clone),
                        output: stdout.to_string(),
                        timestamp: chrono::Utc::now().to_rfc3339(),
                        exit_code: None,
                    });
                }
                
                if !stderr.is_empty() {
                    let _ = window_clone.emit("terminal-output", TerminalOutput {
                        command: format!("ollama pull {}", model_name_clone),
                        output: stderr.to_string(),
                        timestamp: chrono::Utc::now().to_rfc3339(),
                        exit_code: None,
                    });
                }

                let progress = if output.status.success() {
                    PullProgress {
                        model: model_name_clone.clone(),
                        status: "Pull completed successfully".to_string(),
                        progress: Some(100.0),
                        completed: true,
                        error: None,
                    }
                } else {
                    PullProgress {
                        model: model_name_clone.clone(),
                        status: "Pull failed".to_string(),
                        progress: Some(0.0),
                        completed: true,
                        error: Some("Pull process failed".to_string()),
                    }
                };
                let _ = window_clone.emit("pull-progress", progress);
            }
            Err(e) => {
                let _ = window_clone.emit("terminal-output", TerminalOutput {
                    command: format!("ollama pull {}", model_name_clone),
                    output: format!("Error: {}", e),
                    timestamp: chrono::Utc::now().to_rfc3339(),
                    exit_code: Some(-1),
                });

                let _ = window_clone.emit("pull-progress", PullProgress {
                    model: model_name_clone.clone(),
                    status: "Pull failed".to_string(),
                    progress: Some(0.0),
                    completed: true,
                    error: Some(format!("Process error: {}", e)),
                });
            }
        }
    });

    Ok(())
}

#[tauri::command]
async fn run_model(model_name: String) -> Result<String, String> {
    // This starts a model but doesn't keep it running - just validates it can start
    let output = Command::new("ollama")
        .arg("run")
        .arg(&model_name)
        .arg("--help") // Just check if the model can be loaded
        .output()
        .map_err(|e| format!("Failed to run model: {}", e))?;

    if output.status.success() {
        Ok(format!("Model {} is ready to run", model_name))
    } else {
        Err(format!("Failed to run model {}: {}", model_name, String::from_utf8_lossy(&output.stderr)))
    }
}

#[tauri::command]
async fn delete_model(model_name: String) -> Result<String, String> {
    let output = Command::new("ollama")
        .arg("rm")
        .arg(&model_name)
        .output()
        .map_err(|e| format!("Failed to delete model: {}", e))?;

    if output.status.success() {
        Ok(format!("Model {} deleted successfully", model_name))
    } else {
        Err(format!("Failed to delete model {}: {}", model_name, String::from_utf8_lossy(&output.stderr)))
    }
}

#[tauri::command]
async fn send_chat_message(window: Window, model_name: String, message: String) -> Result<(), String> {
    let model_name_clone = model_name.clone();
    let message_clone = message.clone();
    
    tauri::async_runtime::spawn(async move {
        let output = Command::new("ollama")
            .arg("run")
            .arg(&model_name_clone)
            .arg(&message_clone)
            .output();

        match output {
            Ok(output) => {
                let response = String::from_utf8_lossy(&output.stdout);
                let _ = window.emit("chat-response", ChatMessage {
                    role: "assistant".to_string(),
                    content: response.to_string(),
                });
            }
            Err(e) => {
                let _ = window.emit("chat-error", format!("Failed to get response: {}", e));
            }
        }
    });

    Ok(())
}

#[tauri::command]
async fn execute_terminal_command(window: Window, command: String) -> Result<(), String> {
    let timestamp = chrono::Utc::now().to_rfc3339();
    
    // Emit the command being executed
    let _ = window.emit("terminal-output", TerminalOutput {
        command: command.clone(),
        output: format!("$ {}", command),
        timestamp: timestamp.clone(),
        exit_code: None,
    });

    tauri::async_runtime::spawn(async move {
        let parts: Vec<&str> = command.split_whitespace().collect();
        if parts.is_empty() {
            return;
        }

        let mut cmd = Command::new(parts[0]);
        if parts.len() > 1 {
            cmd.args(&parts[1..]);
        }

        match cmd.output() {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                let mut result = String::new();
                
                if !stdout.is_empty() {
                    result.push_str(&stdout);
                }
                if !stderr.is_empty() {
                    if !result.is_empty() {
                        result.push('\n');
                    }
                    result.push_str(&stderr);
                }

                let _ = window.emit("terminal-output", TerminalOutput {
                    command: command.clone(),
                    output: result,
                    timestamp: chrono::Utc::now().to_rfc3339(),
                    exit_code: output.status.code(),
                });
            }
            Err(e) => {
                let _ = window.emit("terminal-output", TerminalOutput {
                    command: command.clone(),
                    output: format!("Error: {}", e),
                    timestamp: chrono::Utc::now().to_rfc3339(),
                    exit_code: Some(-1),
                });
            }
        }
    });

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            list_models,
            check_ollama_status,
            pull_model,
            run_model,
            delete_model,
            send_chat_message,
            execute_terminal_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
