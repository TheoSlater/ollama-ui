import { ollamaModelService } from "./ollama-models";
import { ollamaChatService } from "./ollama-chat";
import { ollamaStatusService } from "./ollama-status";
import type { OllamaModel } from "@/types";

/**
 * Main Ollama service that aggregates all sub-services
 * This provides a unified interface to all Ollama functionality
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

  // Model Management Methods
  public async listModels(): Promise<OllamaModel[]> {
    return ollamaModelService.listModels();
  }

  public async listModelsWithDetails(): Promise<OllamaModel[]> {
    return ollamaModelService.listModelsWithDetails();
  }

  public async pullModel(
    modelName: string,
    onProgress?: (progress: { percentage: number; status: string }) => void
  ): Promise<void> {
    return ollamaModelService.pullModel(modelName, onProgress);
  }

  public async removeModel(modelName: string): Promise<void> {
    return ollamaModelService.removeModel(modelName);
  }

  public async showModel(modelName: string): Promise<string> {
    return ollamaModelService.showModel(modelName);
  }

  public async getModelDetails(
    modelName: string
  ): Promise<Partial<OllamaModel["details"]>> {
    return ollamaModelService.getModelDetails(modelName);
  }

  // Chat Methods
  public async chatWithModel(
    modelName: string,
    prompt: string
  ): Promise<string> {
    return ollamaChatService.chatWithModel(modelName, prompt);
  }

  public async startInteractiveChat(
    modelName: string,
    onMessage?: (message: string) => void
  ): Promise<void> {
    return ollamaChatService.startInteractiveChat(modelName, onMessage);
  }

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
    return ollamaChatService.generate(modelName, prompt, options);
  }

  // Status Methods
  public async checkStatus(): Promise<boolean> {
    return ollamaStatusService.checkStatus();
  }

  public async getDetailedStatus() {
    return ollamaStatusService.getDetailedStatus();
  }

  public async getSystemInfo() {
    return ollamaStatusService.getSystemInfo();
  }

  public async isModelAvailable(modelName: string): Promise<boolean> {
    return ollamaStatusService.isModelAvailable(modelName);
  }

  public async ping() {
    return ollamaStatusService.ping();
  }

  // Direct access to sub-services for advanced usage
  public get models() {
    return ollamaModelService;
  }

  public get chat() {
    return ollamaChatService;
  }

  public get status() {
    return ollamaStatusService;
  }
}

// Export singleton instance
export const ollamaService = OllamaService.getInstance();
