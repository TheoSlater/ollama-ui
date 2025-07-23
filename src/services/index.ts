// Main service
export { ollamaService, OllamaService } from "./ollama";

// Individual services for direct access when needed
export { ollamaModelService, OllamaModelService } from "./ollama-models";
export { ollamaChatService, OllamaChatService } from "./ollama-chat";
export { ollamaStatusService, OllamaStatusService } from "./ollama-status";

// Types
export type { OllamaStatus, OllamaSystemInfo } from "./ollama-status";

// Re-export the main service as default
export { ollamaService as default } from "./ollama";
