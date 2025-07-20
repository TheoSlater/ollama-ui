import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface OllamaModel {
  name: string;
  id: string;
  size: string;
  modified: string;
}

export interface PullProgress {
  model: string;
  status: string;
  progress?: number;
  completed: boolean;
  error?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface TerminalOutput {
  command: string;
  output: string;
  timestamp: string;
  exit_code?: number;
}

export class OllamaService {
  private static instance: OllamaService;
  private pullProgressCallbacks: Map<string, (progress: PullProgress) => void> =
    new Map();

  private constructor() {
    this.initializeProgressListener();
  }

  public static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService();
    }
    return OllamaService.instance;
  }

  private async initializeProgressListener() {
    await listen<PullProgress>("pull-progress", (event) => {
      const progress = event.payload;
      const callback = this.pullProgressCallbacks.get(progress.model);
      if (callback) {
        callback(progress);
      }
    });
  }

  async listModels(): Promise<OllamaModel[]> {
    try {
      return await invoke<OllamaModel[]>("list_models");
    } catch (error) {
      console.error("Failed to list models:", error);
      return [];
    }
  }

  async checkOllamaStatus(): Promise<boolean> {
    try {
      return await invoke<boolean>("check_ollama_status");
    } catch (error) {
      console.error("Failed to check Ollama status:", error);
      return false;
    }
  }

  async pullModel(
    modelName: string,
    onProgress?: (progress: PullProgress) => void
  ): Promise<void> {
    if (onProgress) {
      this.pullProgressCallbacks.set(modelName, onProgress);
    }

    try {
      await invoke("pull_model", { modelName });
    } catch (error) {
      console.error("Failed to pull model:", error);
      if (onProgress) {
        onProgress({
          model: modelName,
          status: "Pull failed",
          progress: 0,
          completed: true,
          error: error as string,
        });
      }
    }
  }

  async runModel(modelName: string): Promise<string> {
    try {
      return await invoke<string>("run_model", { modelName });
    } catch (error) {
      console.error("Failed to run model:", error);
      throw error;
    }
  }

  async deleteModel(modelName: string): Promise<string> {
    try {
      return await invoke<string>("delete_model", { modelName });
    } catch (error) {
      console.error("Failed to delete model:", error);
      throw error;
    }
  }

  async sendChatMessage(modelName: string, message: string): Promise<void> {
    try {
      await invoke("send_chat_message", { modelName, message });
    } catch (error) {
      console.error("Failed to send chat message:", error);
      throw error;
    }
  }

  async executeTerminalCommand(command: string): Promise<void> {
    try {
      await invoke("execute_terminal_command", { command });
    } catch (error) {
      console.error("Failed to execute terminal command:", error);
      throw error;
    }
  }

  async listenForChatResponses(callback: (message: ChatMessage) => void) {
    await listen<ChatMessage>("chat-response", (event) => {
      callback(event.payload);
    });
  }

  async listenForChatErrors(callback: (error: string) => void) {
    await listen<string>("chat-error", (event) => {
      callback(event.payload);
    });
  }

  async listenForTerminalOutput(callback: (output: TerminalOutput) => void) {
    await listen<TerminalOutput>("terminal-output", (event) => {
      callback(event.payload);
    });
  }

  removePullProgressCallback(modelName: string) {
    this.pullProgressCallbacks.delete(modelName);
  }
}

export const ollamaService = OllamaService.getInstance();
