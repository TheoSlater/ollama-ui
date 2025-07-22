// Common types for the application

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface CommandOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface TerminalState {
  isInitialized: boolean;
  currentCommand: string;
  history: string[];
}

export interface AppState {
  models: OllamaModel[];
  loading: boolean;
  error: string | null;
  terminal: TerminalState;
}

export type CommandStatus = "idle" | "running" | "success" | "error";

export interface CommandResult {
  status: CommandStatus;
  output?: string;
  error?: string;
}

export interface UseCommandOptions {
  onSuccess?: (output: string) => void;
  onError?: (error: string) => void;
  showInTerminal?: boolean;
}

export interface UseCommandOptions {
  onSuccess?: (output: string) => void;
  onError?: (error: string) => void;
  showInTerminal?: boolean;
}
