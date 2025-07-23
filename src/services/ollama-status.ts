import { terminalService } from "./terminal";

export interface OllamaStatus {
  isRunning: boolean;
  version?: string;
  error?: string;
}

export interface OllamaSystemInfo {
  version: string;
  models_path?: string;
  gpu_info?: string;
  memory_info?: string;
}

/**
 * Service for checking Ollama status and system information
 */
export class OllamaStatusService {
  /**
   * Check if Ollama is running and accessible
   */
  public async checkStatus(): Promise<boolean> {
    try {
      await terminalService.executeCommandSync("ollama", ["--version"]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get detailed status information
   */
  public async getDetailedStatus(): Promise<OllamaStatus> {
    try {
      const result = await terminalService.executeCommand("ollama", [
        "--version",
      ]);

      if (result.status === "error") {
        return {
          isRunning: false,
          error: result.error || "Failed to get version",
        };
      }

      return {
        isRunning: true,
        version: result.output?.trim() || "Unknown",
      };
    } catch (error) {
      return {
        isRunning: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get system information
   */
  public async getSystemInfo(): Promise<OllamaSystemInfo | null> {
    try {
      const versionResult = await terminalService.executeCommand("ollama", [
        "--version",
      ]);

      if (versionResult.status === "error") {
        return null;
      }

      const systemInfo: OllamaSystemInfo = {
        version: versionResult.output?.trim() || "Unknown",
      };

      // Try to get additional system information
      try {
        const envResult = await terminalService.executeCommand("ollama", [
          "env",
        ]);
        if (envResult.status === "success" && envResult.output) {
          const envLines = envResult.output.split("\n");

          for (const line of envLines) {
            if (line.includes("OLLAMA_MODELS")) {
              systemInfo.models_path = line.split("=")[1]?.trim();
            }
          }
        }
      } catch {
        // Ignore errors getting environment info
      }

      return systemInfo;
    } catch {
      return null;
    }
  }

  /**
   * Check if a specific model is available locally
   */
  public async isModelAvailable(modelName: string): Promise<boolean> {
    try {
      const result = await terminalService.executeCommand("ollama", [
        "show",
        modelName,
      ]);
      return result.status === "success";
    } catch {
      return false;
    }
  }

  /**
   * Ping Ollama service to check responsiveness
   */
  public async ping(): Promise<{
    success: boolean;
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const result = await terminalService.executeCommand("ollama", [
        "--version",
      ]);
      const responseTime = Date.now() - startTime;

      if (result.status === "success") {
        return { success: true, responseTime };
      } else {
        return {
          success: false,
          responseTime,
          error: result.error || "Command failed",
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get running processes (if Ollama is running as a service)
   */
  public async getRunningProcesses(): Promise<string[]> {
    try {
      const result = await terminalService.executeCommand("ps", ["aux"]);

      if (result.status === "success" && result.output) {
        const lines = result.output.split("\n");
        return lines.filter((line) => line.includes("ollama"));
      }

      return [];
    } catch {
      return [];
    }
  }
}

export const ollamaStatusService = new OllamaStatusService();
