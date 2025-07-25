import { Command } from "@tauri-apps/plugin-shell";
import type { CommandResult } from "@/types";

/**
 * Enhanced terminal service with better error handling and state management
 */
export class TerminalService {
  private static instance: TerminalService;
  private outputListeners: Set<(output: string) => void> = new Set();
  private errorListeners: Set<(error: string) => void> = new Set();

  private constructor() {}

  public static getInstance(): TerminalService {
    if (!TerminalService.instance) {
      TerminalService.instance = new TerminalService();
    }
    return TerminalService.instance;
  }

  /**
   * Execute a shell command with enhanced error handling
   */
  public async executeCommand(
    cmd: string,
    args: string[] = []
  ): Promise<CommandResult> {
    try {
      console.log(
        `[TerminalService] Executing command: ${cmd} ${args.join(" ")}`
      );
      const command = Command.create(cmd, args);
      let stdout = "";
      let stderr = "";

      // Set up output handlers
      command.stdout.on("data", (line) => {
        console.log(`[TerminalService] stdout: ${line}`);
        stdout += line + "\n"; // <-- ensure newlines for each chunk
        this.notifyOutputListeners(line);
        this.emitTerminalOutput(line + "\n"); // <-- ensure newlines for each chunk
      });

      command.stderr.on("data", (err) => {
        console.log(`[TerminalService] stderr: ${err}`);
        stderr += err + "\n"; // <-- ensure newlines for each chunk
        const errorOutput = `\x1b[31m${err}\x1b[0m`;
        this.notifyErrorListeners(err);
        this.emitTerminalOutput(errorOutput + "\n"); // <-- ensure newlines for each chunk
      });

      // Execute the command
      console.log(`[TerminalService] Starting command execution...`);
      const output = await command.execute();
      console.log(`[TerminalService] Command completed with output:`, output);

      return {
        status: output.code === 0 ? "success" : "error",
        output: output.stdout || stdout,
        error:
          output.code !== 0
            ? output.stderr ||
              stderr ||
              `Command failed with exit code ${output.code}`
            : undefined,
      };
    } catch (error) {
      console.error(`[TerminalService] Command execution failed:`, error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.notifyErrorListeners(errorMsg);
      this.emitTerminalOutput(`\x1b[31mError: ${errorMsg}\x1b[0m\n`);

      return {
        status: "error",
        error: errorMsg,
      };
    }
  }

  /**
   * Execute a command and return output as string
   */
  public async executeCommandSync(
    cmd: string,
    args: string[] = []
  ): Promise<string> {
    const result = await this.executeCommand(cmd, args);
    if (result.status === "error") {
      throw new Error(result.error || "Command failed");
    }
    return result.output || "";
  }

  /**
   * Execute a command with real-time progress tracking
   */
  public async executeCommandWithProgress(
    cmd: string,
    args: string[] = [],
    onProgress?: (output: string) => void
  ): Promise<CommandResult> {
    try {
      console.log(
        `[TerminalService] Executing command with progress: ${cmd} ${args.join(
          " "
        )}`
      );
      const command = Command.create(cmd, args);
      let stdout = "";
      let stderr = "";

      // Set up output handlers with progress tracking
      command.stdout.on("data", (line) => {
        console.log(`[TerminalService] stdout: ${line}`);
        stdout += line + "\n"; // <-- ensure newlines for each chunk
        this.notifyOutputListeners(line);
        this.emitTerminalOutput(line + "\n"); // <-- ensure newlines for each chunk

        // Call progress callback if provided
        if (onProgress) {
          onProgress(line);
        }
      });

      command.stderr.on("data", (err) => {
        console.log(`[TerminalService] stderr: ${err}`);
        stderr += err + "\n"; // <-- ensure newlines for each chunk
        const errorOutput = `\x1b[31m${err}\x1b[0m`;
        this.notifyErrorListeners(err);
        this.emitTerminalOutput(errorOutput + "\n"); // <-- ensure newlines for each chunk
      });

      // Execute the command
      console.log(
        `[TerminalService] Starting command execution with progress...`
      );
      const output = await command.execute();
      console.log(`[TerminalService] Command completed with output:`, output);

      return {
        status: output.code === 0 ? "success" : "error",
        output: output.stdout || stdout,
        error:
          output.code !== 0
            ? output.stderr ||
              stderr ||
              `Command failed with exit code ${output.code}`
            : undefined,
      };
    } catch (error) {
      console.error(`[TerminalService] Command execution failed:`, error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.notifyErrorListeners(errorMsg);
      this.emitTerminalOutput(`\x1b[31mError: ${errorMsg}\x1b[0m\n`);

      return {
        status: "error",
        error: errorMsg,
      };
    }
  }

  /**
   * Add a listener for command output
   */
  public onOutput(callback: (output: string) => void): () => void {
    this.outputListeners.add(callback);
    return () => this.outputListeners.delete(callback);
  }

  /**
   * Add a listener for command errors
   */
  public onError(callback: (error: string) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  /**
   * Emit terminal output to the frontend
   */
  private emitTerminalOutput(output: string): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("terminal-output", { detail: output })
      );
    }
  }

  /**
   * Notify all output listeners
   */
  private notifyOutputListeners(output: string): void {
    this.outputListeners.forEach((callback) => {
      try {
        callback(output);
      } catch (error) {
        console.error("Error in output listener:", error);
      }
    });
  }

  /**
   * Notify all error listeners
   */
  private notifyErrorListeners(error: string): void {
    this.errorListeners.forEach((callback) => {
      try {
        callback(error);
      } catch (error) {
        console.error("Error in error listener:", error);
      }
    });
  }

  /**
   * Clean up all listeners
   */
  public cleanup(): void {
    this.outputListeners.clear();
    this.errorListeners.clear();
  }
}

// Export singleton instance
export const terminalService = TerminalService.getInstance();
