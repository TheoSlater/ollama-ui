import { invoke } from "@tauri-apps/api/core";

export async function runShellCommand(cmd: string, args: string[] = []) {
  return invoke("run_command", { command: cmd, args });
}
