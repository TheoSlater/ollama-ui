import { Paper, Box, Typography, Chip, IconButton } from "@mui/material";
import { Terminal } from "@mui/icons-material";

interface StatusBarProps {
  isOllamaRunning: boolean;
  currentModel?: string;
  activeCommand?: string;
  progress?: number;
  onTerminalToggle: () => void;
}

export default function StatusBar({
  isOllamaRunning,
  currentModel,
  activeCommand,
  progress,
  onTerminalToggle,
}: StatusBarProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        px: 3,
        py: 1.5,
        backgroundColor: "white",
        borderTop: "1px solid #e0e0e0",
        borderRadius: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label={isOllamaRunning ? "Ollama Running" : "Ollama Stopped"}
            color={isOllamaRunning ? "success" : "error"}
            variant="outlined"
            size="small"
            sx={{
              fontSize: "0.75rem",
              height: 24,
              borderRadius: "12px",
            }}
          />

          {currentModel && (
            <>
              <Typography variant="body2" sx={{ color: "#666666" }}>
                |
              </Typography>
              <Typography variant="body2" sx={{ color: "#666666" }}>
                Model: {currentModel}
              </Typography>
            </>
          )}

          {activeCommand && (
            <>
              <Typography variant="body2" sx={{ color: "#666666" }}>
                |
              </Typography>
              <Typography variant="body2" sx={{ color: "#666666" }}>
                {activeCommand}
                {progress !== undefined && `: ${progress}%`}
              </Typography>
            </>
          )}
        </Box>

        <IconButton
          onClick={onTerminalToggle}
          size="small"
          sx={{
            color: "#666666",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          <Terminal fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}
