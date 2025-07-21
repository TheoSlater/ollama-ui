import { terminalService } from "./terminal";
import type { OllamaModel } from "@/types";

/**
 * Service for managing Ollama operations
 */
export class OllamaService {
  private static instance: OllamaService;

  private constructor() {}

  public static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService();
    }
    return OllamaService.instance;
  }

  /**
   * List all installed Ollama models
   */
  public async listModels(): Promise<OllamaModel[]> {
    try {
      const output = await terminalService.executeCommandSync("ollama", [
        "list",
      ]);
      return this.parseModelList(output);
    } catch (error) {
      console.error("Failed to list models:", error);
      throw new Error("Failed to retrieve model list");
    }
  }

  /**
   * Pull a model from Ollama registry
   */
  public async pullModel(modelName: string): Promise<void> {
    const result = await terminalService.executeCommand("ollama", [
      "pull",
      modelName,
    ]);
    if (result.status === "error") {
      throw new Error(result.error || `Failed to pull model: ${modelName}`);
    }
  }

  /**
   * Remove a model from local storage
   */
  public async removeModel(modelName: string): Promise<void> {
    const result = await terminalService.executeCommand("ollama", [
      "rm",
      modelName,
    ]);
    if (result.status === "error") {
      throw new Error(result.error || `Failed to remove model: ${modelName}`);
    }
  }

  /**
   * Show details about a specific model
   */
  public async showModel(modelName: string): Promise<string> {
    const result = await terminalService.executeCommand("ollama", [
      "show",
      modelName,
    ]);
    if (result.status === "error") {
      throw new Error(result.error || `Failed to show model: ${modelName}`);
    }
    return result.output || "";
  }

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
   * Parse the output from 'ollama list' command
   */
  private parseModelList(output: string): OllamaModel[] {
    const lines = output.trim().split("\n");

    // Skip header line
    if (lines.length <= 1) return [];

    const models: OllamaModel[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const model = this.parseModelLine(line);
        if (model) models.push(model);
      } catch (error) {
        console.warn(`Failed to parse model line: ${line}`, error);
      }
    }

    return models;
  }

  /**
   * Parse a single line from ollama list output
   */
  private parseModelLine(line: string): OllamaModel | null {
    // Example line: "llama3:latest    Dec 12, 2024    4.7 GB    6a0746a1ec1a"
    const parts = line.split(/\s+/);
    if (parts.length < 4) return null;

    const name = parts[0];
    const modified_at = parts.slice(1, -2).join(" ");
    const sizeStr = parts[parts.length - 2] + " " + parts[parts.length - 1];
    const digest = parts[parts.length - 1];

    // Convert size to bytes (approximate)
    const size = this.parseSizeToBytes(sizeStr);

    return {
      name,
      modified_at,
      size,
      digest,
      details: {
        format: "GGUF", // Default format for Ollama models
        family: name.split(":")[0],
        families: [name.split(":")[0]],
        parameter_size: "Unknown",
        quantization_level: "Unknown",
      },
    };
  }

  /**
   * Convert size string (e.g., "4.7 GB") to bytes
   */
  private parseSizeToBytes(sizeStr: string): number {
    const match = sizeStr.match(/(\d+\.?\d*)\s*(GB|MB|KB|B)/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case "gb":
        return value * 1024 * 1024 * 1024;
      case "mb":
        return value * 1024 * 1024;
      case "kb":
        return value * 1024;
      default:
        return value;
    }
  }
}

// Export singleton instance
export const ollamaService = OllamaService.getInstance();
