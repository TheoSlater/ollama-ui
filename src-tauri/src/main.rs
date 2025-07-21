#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{ Emitter, Window};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::{ CommandEvent};

#[tauri::command]
async fn run_command(window: Window, cmd: String, args: Vec<String>) -> Result<(), String> {
    let (mut rx, _child) = window
        .shell()
        .command(cmd)
        .args(args)
        .spawn()
        .map_err(|e| e.to_string())?;

    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(line_bytes) => {
                let line = String::from_utf8_lossy(&line_bytes).to_string();
                window.emit("terminal-output", line).map_err(|e| e.to_string())?;
            }
            CommandEvent::Stderr(line_bytes) => {
                let line = String::from_utf8_lossy(&line_bytes).to_string();
                window.emit("terminal-output", format!("\x1b[31m{}\x1b[0m", line)).map_err(|e| e.to_string())?;
            }
            CommandEvent::Terminated(payload) => {
                let status_msg = if payload.code.unwrap_or(-1) == 0 {
                    ""
                } else {
                    &format!("\x1b[31mProcess exited with code {}\x1b[0m\n", payload.code.unwrap_or(-1))
                };
                window.emit("terminal-output", status_msg).map_err(|e| e.to_string())?;
                break;
            }
            _ => {}
        }
    }

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![run_command])
        .run(tauri::generate_context!())
        .expect("failed to run app");
}
