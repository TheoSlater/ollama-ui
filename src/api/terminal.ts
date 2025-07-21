import { Command } from "@tauri-apps/plugin-shell";

export async function runShellCommand(
  cmd: string,
  args: string[] = []
): Promise<void> {
  try {
    // Use the shell plugin Command directly with output handling
    const command = Command.create(cmd, args);

    let output = "";

    command.stdout.on("data", (line) => {
      output += line;
      // Emit output to frontend via window events
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("terminal-output", { detail: line })
        );
      }
    });

    command.stderr.on("data", (err) => {
      const errorOutput = `\x1b[31m${err}\x1b[0m`;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("terminal-output", { detail: errorOutput })
        );
      }
    });

    await command.spawn();
  } catch (error) {
    console.error("Command execution failed:", error);
    const errorMsg = `\x1b[31mError: ${error}\x1b[0m\n`;
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("terminal-output", { detail: errorMsg })
      );
    }
    throw error;
  }
}
