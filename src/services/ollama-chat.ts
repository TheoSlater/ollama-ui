import { terminalService } from "./terminal";

/**
 * Service for chatting and interacting with Ollama models
 */
export class OllamaChatService {
  /**
   * Chat with a model using ollama run
   */
  public async chatWithModel(
    modelName: string,
    prompt: string
  ): Promise<string> {
    // Use ollama run <model> <prompt>
    const result = await terminalService.executeCommand("ollama", [
      "run",
      modelName,
      prompt,
    ]);

    if (result.status === "error") {
      throw new Error(result.error || "Failed to chat with model");
    }

    return result.output?.trim() || "";
  }

  /**
   * Start an interactive chat session with a model
   */
  public async startInteractiveChat(
    modelName: string,
    onMessage?: (message: string) => void
  ): Promise<void> {
    // This would be used for streaming chat sessions
    const result = await terminalService.executeCommandWithProgress(
      "ollama",
      ["run", modelName],
      (output) => {
        if (onMessage) {
          onMessage(output);
        }
      }
    );

    if (result.status === "error") {
      throw new Error(
        result.error || `Failed to start chat with model: ${modelName}`
      );
    }
  }

  /**
   * Send a message to an ongoing chat session
   */
  public async sendMessage(
    message: string,
    onResponse?: (chunk: string) => void
  ): Promise<string> {
    // This would be used to send messages to an active chat session
    // Implementation would depend on how you handle ongoing sessions

    // For now, this is a placeholder
    // TODO: Create a proper implementation for interactive sessions
    throw new Error("Interactive sessions not yet implemented");
  }

  /**
   * Generate text with specific parameters
   */
  public async generate(
    modelName: string,
    prompt: string,
    options?: {
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
      stop?: string[];
    }
  ): Promise<string> {
    // Build command arguments
    const args = ["run", modelName];

    // Add options if provided
    if (options?.temperature !== undefined) {
      args.push("--temperature", options.temperature.toString());
    }
    if (options?.top_p !== undefined) {
      args.push("--top-p", options.top_p.toString());
    }
    if (options?.max_tokens !== undefined) {
      args.push("--max-tokens", options.max_tokens.toString());
    }

    // Add the prompt last
    args.push(prompt);

    const result = await terminalService.executeCommand("ollama", args);

    if (result.status === "error") {
      throw new Error(result.error || "Failed to generate text");
    }

    return result.output?.trim() || "";
  }
}

// Export singleton instance
export const ollamaChatService = new OllamaChatService();
