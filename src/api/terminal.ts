import { invoke } from "@tauri-apps/api/core";

export async function runShellCommand(
  cmd: string,
  args: string[] = []
): Promise<void> {
  try {
    await invoke("run_command", { cmd, args });
  } catch (error) {
    console.error("Command execution failed:", error);
    throw error;
  }
}
