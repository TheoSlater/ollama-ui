import { useCallback, useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { terminalService } from "@/services/terminal";
import { useAppContext } from "@/stores/AppContext";

/**
 * Hook for managing terminal instance and state
 */
export function useTerminal() {
  const { state, dispatch } = useAppContext();
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize terminal
  const initializeTerminal = useCallback(
    (container: HTMLDivElement) => {
      if (state.terminal.isInitialized || terminalRef.current) {
        return terminalRef.current;
      }

      const terminal = new XTerm({
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

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(container);

      // Initial setup
      terminal.writeln("Welcome to Ollama UI Terminal");
      terminal.write("$ ");

      // Handle terminal input
      terminal.onData((data) => {
        handleTerminalInput(data, terminal);
      });

      // Store references
      terminalRef.current = terminal;
      fitAddonRef.current = fitAddon;
      containerRef.current = container;

      dispatch({ type: "SET_TERMINAL_INITIALIZED", payload: true });

      return terminal;
    },
    [state.terminal.isInitialized, dispatch]
  );

  // Handle terminal input
  const handleTerminalInput = useCallback(
    (data: string, terminal: XTerm) => {
      const currentCommand = state.terminal.currentCommand;

      switch (data) {
        case "\u0003": // Ctrl+C
          terminal.write("^C");
          terminal.writeln("");
          dispatch({ type: "SET_CURRENT_COMMAND", payload: "" });
          terminal.write("$ ");
          break;

        case "\r": // Enter
          terminal.writeln("");
          if (currentCommand.trim()) {
            executeTerminalCommand(currentCommand.trim(), terminal);
            dispatch({
              type: "ADD_TO_HISTORY",
              payload: currentCommand.trim(),
            });
          } else {
            terminal.write("$ ");
          }
          dispatch({ type: "SET_CURRENT_COMMAND", payload: "" });
          break;

        case "\u007F": // Backspace
          if (currentCommand.length > 0) {
            const newCommand = currentCommand.slice(0, -1);
            dispatch({ type: "SET_CURRENT_COMMAND", payload: newCommand });
            terminal.write("\b \b");
          }
          break;

        default:
          if (data >= " " || data === "\t") {
            const newCommand = currentCommand + data;
            dispatch({ type: "SET_CURRENT_COMMAND", payload: newCommand });
            terminal.write(data);
          }
          break;
      }
    },
    [state.terminal.currentCommand, dispatch]
  );

  // Execute command in terminal
  const executeTerminalCommand = useCallback(
    async (command: string, terminal: XTerm) => {
      const parts = command.split(" ");
      const cmd = parts[0];
      const args = parts.slice(1);

      try {
        await terminalService.executeCommand(cmd, args);
        // Prompt will be shown after command output
        setTimeout(() => {
          terminal.write("$ ");
        }, 100);
      } catch (error) {
        terminal.writeln(`\x1b[31mError: ${error}\x1b[0m`);
        terminal.write("$ ");
      }
    },
    []
  );

  // Fit terminal to container
  const fitTerminal = useCallback(() => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();
    }
  }, []);

  // Listen for terminal output events
  useEffect(() => {
    const handleTerminalOutput = (event: CustomEvent) => {
      if (terminalRef.current) {
        terminalRef.current.write(event.detail);
      }
    };

    window.addEventListener(
      "terminal-output",
      handleTerminalOutput as EventListener
    );

    return () => {
      window.removeEventListener(
        "terminal-output",
        handleTerminalOutput as EventListener
      );
    };
  }, []);

  // Cleanup terminal
  const cleanup = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.dispose();
      terminalRef.current = null;
    }
    fitAddonRef.current = null;
    containerRef.current = null;
    dispatch({ type: "SET_TERMINAL_INITIALIZED", payload: false });
    dispatch({ type: "SET_CURRENT_COMMAND", payload: "" });
  }, [dispatch]);

  // Clear terminal history
  const clearHistory = useCallback(() => {
    dispatch({ type: "CLEAR_HISTORY" });
  }, [dispatch]);

  return {
    // State
    isInitialized: state.terminal.isInitialized,
    currentCommand: state.terminal.currentCommand,
    history: state.terminal.history,

    // Actions
    initializeTerminal,
    fitTerminal,
    cleanup,
    clearHistory,

    // Refs
    terminal: terminalRef.current,
    fitAddon: fitAddonRef.current,
    container: containerRef.current,
  };
}
