import { useCallback, useState } from "react";
import { terminalService } from "@/services/terminal";
import type { CommandStatus, CommandResult, UseCommandOptions } from "@/types";

/**
 * Hook for executing shell commands with proper state management
 */
export function useCommand(options: UseCommandOptions = {}) {
  const [status, setStatus] = useState<CommandStatus>("idle");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (command: string, args: string[] = []): Promise<CommandResult> => {
      setStatus("running");
      setError(null);
      setOutput("");

      try {
        const result = await terminalService.executeCommand(command, args);

        if (result.status === "success") {
          setStatus("success");
          setOutput(result.output || "");
          options.onSuccess?.(result.output || "");
        } else {
          setStatus("error");
          setError(result.error || "Command failed");
          options.onError?.(result.error || "Command failed");
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setStatus("error");
        setError(errorMessage);
        options.onError?.(errorMessage);

        return {
          status: "error",
          error: errorMessage,
        };
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setOutput("");
    setError(null);
  }, []);

  return {
    execute,
    status,
    output,
    error,
    isLoading: status === "running",
    isSuccess: status === "success",
    isError: status === "error",
    reset,
  };
}
