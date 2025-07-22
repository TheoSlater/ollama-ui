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
   * List all installed Ollama models (fast version without detailed info)
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
   * Pull a model from Ollama registry with progress tracking
   */
  public async pullModel(
    modelName: string,
    onProgress?: (progress: { percentage: number; status: string }) => void
  ): Promise<void> {
    const result = await terminalService.executeCommandWithProgress(
      "ollama",
      ["pull", modelName],
      (output) => {
        // Parse ollama pull progress output
        const progress = this.parseProgressOutput(output);
        if (progress && onProgress) {
          onProgress(progress);
        }
      }
    );

    if (result.status === "error") {
      throw new Error(result.error || `Failed to pull model: ${modelName}`);
    }
  }

  /**
   * Parse progress output from ollama pull command
   */
  private parseProgressOutput(
    output: string
  ): { percentage: number; status: string } | null {
    // Split output into lines, trim, and filter out empty lines
    const lines = output
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return null;

    // Find the most recent line with a percentage (e.g. "downloading ... 35%")
    let foundPercentage: number | null = null;
    let foundStatus: string | null = null;

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const percentMatch = line.match(/(\d+)%/);
      if (percentMatch) {
        foundPercentage = parseInt(percentMatch[1]);
        foundStatus = line;
        break;
      }
    }

    if (foundPercentage !== null && foundStatus !== null) {
      return {
        percentage: foundPercentage,
        status: foundStatus,
      };
    }

    // Fallback: handle known status messages
    const lastLine = lines[lines.length - 1];
    if (lastLine.includes("pulling manifest")) {
      return { percentage: 5, status: "Pulling manifest..." };
    } else if (lastLine.includes("downloading")) {
      return { percentage: 10, status: "Downloading..." };
    } else if (lastLine.includes("verifying")) {
      return { percentage: 90, status: "Verifying..." };
    } else if (lastLine.includes("writing manifest")) {
      return { percentage: 95, status: "Writing manifest..." };
    } else if (lastLine.includes("success")) {
      return { percentage: 100, status: "Complete!" };
    }

    // If nothing matches, show 0% but update status
    return { percentage: 0, status: lastLine };
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
    console.log(`[OllamaService] Raw ollama list output:\n${output}`);

    const lines = output.trim().split("\n");
    console.log(`[OllamaService] Split into ${lines.length} lines`);

    // Skip header line
    if (lines.length <= 1) {
      console.warn(
        `[OllamaService] No data lines found (only ${lines.length} lines total)`
      );
      return [];
    }

    const models: OllamaModel[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        console.log(`[OllamaService] Skipping empty line ${i}`);
        continue;
      }

      try {
        const model = this.parseModelLine(line);
        if (model) {
          models.push(model);
          console.log(
            `[OllamaService] Successfully parsed model: ${model.name}`
          );
        }
      } catch (error) {
        console.warn(
          `[OllamaService] Failed to parse model line: ${line}`,
          error
        );
      }
    }

    console.log(`[OllamaService] Parsed ${models.length} models total`);
    return models;
  }

  /**
   * Parse a single line from ollama list output
   */
  private parseModelLine(line: string): OllamaModel | null {
    // Expected format: "NAME ID SIZE MODIFIED"
    // Example: "tinyllama:latest f02e3c24e8ba 0.6 GB 2 months ago"
    console.log(`[OllamaService] Parsing model line: "${line}"`);

    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) {
      console.warn(
        `[OllamaService] Insufficient parts in line: ${parts.length}`
      );
      return null;
    }

    const name = parts[0];
    const digest = parts[1];
    const sizeStr = parts[2] + " " + parts[3];
    const modifiedParts = parts.slice(4);
    const modified_at = modifiedParts.join(" ");

    console.log(
      `[OllamaService] Parsed: name=${name}, digest=${digest}, size=${sizeStr}, modified=${modified_at}`
    );

    // Convert size to bytes
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
   * Get detailed information about a model
   */
  public async getModelDetails(
    modelName: string
  ): Promise<Partial<OllamaModel["details"]>> {
    try {
      const output = await this.showModel(modelName);
      const details = this.parseModelDetails(output);

      // If we couldn't extract family from the output, use the model name
      if (details.family === "Unknown" || !details.family) {
        const familyFromName = modelName.split(":")[0];
        details.family = familyFromName;
        details.families = [familyFromName];
      }

      return details;
    } catch (error) {
      console.warn(`Failed to get details for model ${modelName}:`, error);

      // Return default details based on model name
      const familyFromName = modelName.split(":")[0];
      return {
        format: "GGUF",
        family: familyFromName,
        families: [familyFromName],
        parameter_size: "Unknown",
        quantization_level: "Unknown",
      };
    }
  }

  /**
   * Parse model details from 'ollama show' output
   */
  private parseModelDetails(output: string): Partial<OllamaModel["details"]> {
    const lines = output.split("\n");
    const details: Partial<OllamaModel["details"]> = {
      format: "GGUF",
      family: "Unknown",
      families: [],
      parameter_size: "Unknown",
      quantization_level: "Unknown",
    };

    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      const originalLine = line.trim();

      // Look for architecture/family information
      if (
        trimmed.includes("architecture") ||
        trimmed.includes("family") ||
        trimmed.includes("model")
      ) {
        const match = originalLine.match(/:\s*(.+)/);
        if (match) {
          const family = match[1].trim();
          details.family = family;
          details.families = [family];
        }
      }

      // Look for parameter size - more flexible patterns
      if (trimmed.includes("parameter") || trimmed.includes("param")) {
        const match = originalLine.match(/(\d+\.?\d*\s*[BMG])/i);
        if (match) {
          details.parameter_size = match[1].replace(/\s+/g, "");
        }
      }

      // Look for quantization level
      if (trimmed.includes("quantization") || trimmed.includes("quant")) {
        const match = originalLine.match(/:\s*(.+)/);
        if (match) {
          details.quantization_level = match[1].trim();
        }
      }

      // Look for format information
      if (trimmed.includes("format") || trimmed.includes("type")) {
        const match = originalLine.match(/:\s*(.+)/);
        if (match) {
          details.format = match[1].trim();
        }
      }

      // Try to extract model family from model name patterns
      if (trimmed.includes("model name") || trimmed.includes("name")) {
        const match = originalLine.match(/:\s*(.+)/);
        if (match) {
          const modelName = match[1].trim();
          // Extract family from common patterns like "llama", "tinyllama", etc.
          const familyMatch = modelName.match(/^([a-zA-Z]+)/);
          if (familyMatch && details.family === "Unknown") {
            details.family = familyMatch[1];
            details.families = [familyMatch[1]];
          }
        }
      }
    }

    return details;
  }

  /**
   * List all installed Ollama models with detailed information
   */
  public async listModelsWithDetails(): Promise<OllamaModel[]> {
    try {
      const output = await terminalService.executeCommandSync("ollama", [
        "list",
      ]);
      const models = this.parseModelList(output);

      // Fetch detailed information for each model
      const modelsWithDetails = await Promise.all(
        models.map(async (model) => {
          const details = await this.getModelDetails(model.name);
          return {
            ...model,
            details: {
              ...model.details,
              ...details,
            },
          };
        })
      );

      return modelsWithDetails;
    } catch (error) {
      console.error("Failed to list models with details:", error);
      throw new Error("Failed to retrieve model list with details");
    }
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
