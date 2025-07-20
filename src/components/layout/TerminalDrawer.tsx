import {
  SwipeableDrawer,
  Box,
  Typography,
  Paper,
  IconButton,
  TextField,
} from "@mui/material";
import { Close, Send, Clear } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import {
  ollamaService,
  TerminalOutput,
  PullProgress,
} from "../../services/ollamaService";

interface TerminalDrawerProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function TerminalDrawer({
  open,
  onOpen,
  onClose,
}: TerminalDrawerProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const [command, setCommand] = useState("");
  const currentCommand = useRef("");

  // Set up terminal output listener
  const setupTerminalListener = async () => {
    await ollamaService.listenForTerminalOutput((output: TerminalOutput) => {
      console.log("Received terminal output:", output);
      if (terminal.current) {
        // Write output to terminal
        const lines = output.output.split("\n");
        lines.forEach((line, index) => {
          if (line) {
            terminal.current?.writeln(line);
          } else if (index < lines.length - 1) {
            terminal.current?.writeln("");
          }
        });
        terminal.current.write("$ ");
      } else {
        console.log("Terminal not initialized when output received");
      }
    });
  };

  // Set up pull progress listener for terminal display
  const setupPullProgressListener = async () => {
    // Listen directly to the pull-progress event
    const { listen } = await import("@tauri-apps/api/event");
    await listen<PullProgress>("pull-progress", (event) => {
      const progress = event.payload;
      console.log("Received pull progress:", progress);
      if (terminal.current) {
        const progressLine = progress.progress
          ? `Pulling ${progress.model}: ${progress.status} (${Math.round(
              progress.progress * 100
            )}%)`
          : `Pulling ${progress.model}: ${progress.status}`;

        if (progress.error) {
          terminal.current.writeln(
            `\r\x1b[31m${progressLine} - Error: ${progress.error}\x1b[0m`
          );
          terminal.current.write("$ ");
        } else if (progress.completed) {
          terminal.current.writeln(
            `\r\x1b[32m${progressLine} - Complete!\x1b[0m`
          );
          terminal.current.write("$ ");
        } else {
          // Use carriage return to overwrite the previous line for progress updates
          terminal.current.write(`\r\x1b[33m${progressLine}\x1b[0m`);
        }
      }
    });
  };

  // Initialize listeners once when component mounts
  useEffect(() => {
    setupTerminalListener();
    setupPullProgressListener();
  }, []);

  const executeCommand = async (cmd: string) => {
    console.log(`Executing command: ${cmd}`);
    if (terminal.current) {
      terminal.current.writeln(`\x1b[32m$ ${cmd}\x1b[0m`);
    }

    try {
      await ollamaService.executeTerminalCommand(cmd);
      console.log(`Command executed successfully: ${cmd}`);
    } catch (error) {
      console.error(`Command failed: ${cmd}`, error);
      if (terminal.current) {
        terminal.current.writeln(`\x1b[31mError: ${error}\x1b[0m`);
        terminal.current.write("$ ");
      }
    }
  };

  // Initialize terminal when drawer opens
  useEffect(() => {
    if (open && terminalRef.current) {
      // Dispose existing terminal if any
      if (terminal.current) {
        terminal.current.dispose();
        terminal.current = null;
        fitAddon.current = null;
      }

      console.log("Initializing terminal...");

      terminal.current = new Terminal({
        theme: {
          background: "#1e1e1e",
          foreground: "#ffffff",
          cursor: "#00ff00",
          cursorAccent: "#00ff00",
          selectionBackground: "#ffffff40",
        },
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: 14,
        lineHeight: 1.2,
        cursorBlink: true,
        convertEol: true,
      });

      fitAddon.current = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      terminal.current.loadAddon(fitAddon.current);
      terminal.current.loadAddon(webLinksAddon);

      terminal.current.open(terminalRef.current);

      // Delay to ensure DOM is ready
      setTimeout(() => {
        if (fitAddon.current) {
          fitAddon.current.fit();
          console.log("Terminal fitted");
        }
      }, 200);

      // Welcome message
      terminal.current.writeln("\x1b[32mWelcome to Ollama Terminal!\x1b[0m");
      terminal.current.writeln("Type commands below or use the input field.");
      terminal.current.write("\r\n$ ");

      // Handle terminal input
      terminal.current.onData((data) => {
        if (data === "\r") {
          // Enter key
          const currentLine = currentCommand.current;
          if (currentLine.trim()) {
            terminal.current?.writeln("");
            executeCommand(currentLine.trim());
            currentCommand.current = "";
          } else {
            terminal.current?.write("\r\n$ ");
          }
        } else if (data === "\u007f") {
          // Backspace
          if (currentCommand.current.length > 0) {
            currentCommand.current = currentCommand.current.slice(0, -1);
            terminal.current?.write("\b \b");
          }
        } else if (data >= " ") {
          // Printable characters
          currentCommand.current += data;
          terminal.current?.write(data);
        }
      });
    }
  }, [open]);

  // Cleanup terminal when component unmounts
  useEffect(() => {
    return () => {
      if (terminal.current) {
        console.log("Disposing terminal...");
        terminal.current.dispose();
        terminal.current = null;
        fitAddon.current = null;
      }
    };
  }, []);

  const handleSendCommand = async () => {
    if (!command.trim()) return;

    console.log(`Sending command from input: ${command.trim()}`);
    await executeCommand(command.trim());
    setCommand("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendCommand();
    }
  };

  const clearTerminal = () => {
    if (terminal.current) {
      terminal.current.clear();
      terminal.current.writeln("\x1b[32mWelcome to Ollama Terminal!\x1b[0m");
      terminal.current.writeln("Type commands below or use the input field.");
      terminal.current.write("\r\n$ ");
    }
    currentCommand.current = "";
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen={false}
      sx={{
        "& .MuiDrawer-paper": {
          height: "40vh",
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Paper
        sx={{
          height: "100%",
          borderRadius: "16px 16px 0 0",
          backgroundColor: "#1e1e1e",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: "1px solid #333333",
          }}
        >
          <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: 500 }}>
            Terminal
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={clearTerminal}
              size="small"
              sx={{ color: "#ffffff" }}
              title="Clear Terminal"
            >
              <Clear />
            </IconButton>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ color: "#ffffff" }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>

        {/* Xterm.js Terminal */}
        <Box
          ref={terminalRef}
          sx={{
            flex: 1,
            backgroundColor: "#1e1e1e",
            "& .xterm": {
              padding: "16px",
            },
            "& .xterm-viewport": {
              backgroundColor: "#1e1e1e !important",
            },
            "& .xterm-screen": {
              backgroundColor: "#1e1e1e !important",
            },
          }}
        />

        {/* Command Input */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #333333",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography sx={{ color: "#00ff00", fontFamily: "monospace" }}>
            $
          </Typography>
          <TextField
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter command..."
            variant="standard"
            fullWidth
            sx={{
              "& .MuiInputBase-input": {
                color: "#ffffff",
                fontFamily: "monospace",
                fontSize: "0.875rem",
              },
              "& .MuiInput-underline:before": {
                borderBottomColor: "#333333",
              },
              "& .MuiInput-underline:hover:before": {
                borderBottomColor: "#555555",
              },
              "& .MuiInput-underline:after": {
                borderBottomColor: "#00ff00",
              },
            }}
          />
          <IconButton
            onClick={handleSendCommand}
            size="small"
            sx={{ color: "#00ff00" }}
          >
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </SwipeableDrawer>
  );
}
