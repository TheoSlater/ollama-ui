import { useEffect, useRef, useCallback } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { runShellCommand } from "@/api/terminal";
import "@xterm/xterm/css/xterm.css";

interface TerminalProps {
  className?: string;
}

// Global terminal instance to persist across sheet open/close
let globalTerminal: XTerm | null = null;
let globalFitAddon: FitAddon | null = null;
let globalContainer: HTMLDivElement | null = null;
let terminalOutputHandler: ((event: CustomEvent) => void) | null = null;
let currentCommand = "";
let isInitialized = false;

export function Terminal({ className }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  const initializeTerminal = useCallback(async () => {
    if (isInitialized) return;

    // Create a persistent container
    globalContainer = document.createElement("div");
    globalContainer.style.width = "100%";
    globalContainer.style.height = "100%";

    // Create terminal instance
    globalTerminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily:
        '"Cascadia Code", "Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
      theme: {
        background: "#1e1e1e",
        foreground: "#ffffff",
        cursor: "#ffffff",
      },
    });

    // Create fit addon
    globalFitAddon = new FitAddon();
    globalTerminal.loadAddon(globalFitAddon);

    // Open terminal in the persistent container
    globalTerminal.open(globalContainer);

    // Initial prompt
    globalTerminal.writeln("Welcome to Ollama UI Terminal");
    globalTerminal.write("$ ");

    // Execute shell command
    const executeCommand = async (command: string) => {
      const parts = command.split(" ");
      const cmd = parts[0];
      const args = parts.slice(1);

      try {
        await runShellCommand(cmd, args);
        // Show prompt after command execution
        setTimeout(() => {
          globalTerminal?.write("$ ");
        }, 100);
      } catch (error) {
        globalTerminal?.writeln(`\x1b[31mError: ${error}\x1b[0m`);
        globalTerminal?.write("$ ");
      }
    };

    // Handle terminal input
    globalTerminal.onData((data) => {
      switch (data) {
        case "\u0003": // Ctrl+C
          globalTerminal?.write("^C");
          globalTerminal?.writeln("");
          currentCommand = "";
          globalTerminal?.write("$ ");
          break;
        case "\r": // Enter
          globalTerminal?.writeln("");
          if (currentCommand.trim()) {
            executeCommand(currentCommand.trim());
          } else {
            globalTerminal?.write("$ ");
          }
          currentCommand = "";
          break;
        case "\u007F": // Backspace
          if (currentCommand.length > 0) {
            currentCommand = currentCommand.slice(0, -1);
            globalTerminal?.write("\b \b");
          }
          break;
        default:
          if (data >= " " || data === "\t") {
            currentCommand += data;
            globalTerminal?.write(data);
          }
          break;
      }
    });

    // Listen for terminal output from frontend events
    const handleTerminalOutput = (event: CustomEvent) => {
      const output = event.detail;
      globalTerminal?.write(output);
    };

    terminalOutputHandler = handleTerminalOutput;
    window.addEventListener(
      "terminal-output",
      handleTerminalOutput as EventListener
    );

    isInitialized = true;
  }, []);

  // Mount terminal to DOM when component mounts
  useEffect(() => {
    if (!terminalRef.current) return;

    const mountTerminal = async () => {
      // Initialize terminal if it doesn't exist
      await initializeTerminal();

      // Move the persistent container to the current ref
      if (globalContainer && terminalRef.current) {
        terminalRef.current.appendChild(globalContainer);

        // Fit after mounting
        setTimeout(() => {
          globalFitAddon?.fit();
        }, 50);
      }
    };

    mountTerminal();

    // Handle resize
    const handleResize = () => {
      globalFitAddon?.fit();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount - remove container but don't dispose
    return () => {
      window.removeEventListener("resize", handleResize);
      if (globalContainer && globalContainer.parentNode) {
        globalContainer.parentNode.removeChild(globalContainer);
      }
    };
  }, [initializeTerminal]);

  // Fit terminal when container size changes
  useEffect(() => {
    if (globalFitAddon) {
      const timer = setTimeout(() => {
        globalFitAddon?.fit();
      }, 100);
      return () => clearTimeout(timer);
    }
  });

  return (
    <div className={`w-full h-full ${className || ""}`}>
      <div
        ref={terminalRef}
        className="w-full h-full p-2"
        style={{ minHeight: "200px" }}
      />
    </div>
  );
}

// Export cleanup function for app shutdown
export const cleanupTerminal = () => {
  if (terminalOutputHandler) {
    window.removeEventListener(
      "terminal-output",
      terminalOutputHandler as EventListener
    );
    terminalOutputHandler = null;
  }
  if (globalContainer && globalContainer.parentNode) {
    globalContainer.parentNode.removeChild(globalContainer);
  }
  if (globalTerminal) {
    globalTerminal.dispose();
    globalTerminal = null;
  }
  globalFitAddon = null;
  globalContainer = null;
  isInitialized = false;
};
