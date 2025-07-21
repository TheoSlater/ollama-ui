// Legacy terminal API - now uses the new terminal service
// This file is kept for backward compatibility

import { terminalService } from "@/services/terminal";

/**
 * @deprecated Use terminalService.executeCommand instead
 */
export async function runShellCommand(
  cmd: string,
  args: string[] = []
): Promise<void> {
  const result = await terminalService.executeCommand(cmd, args);
  if (result.status === "error") {
    throw new Error(result.error || "Command failed");
  }
}
