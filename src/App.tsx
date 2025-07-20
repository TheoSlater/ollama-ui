"use client";

import { AppBar, Toolbar, Typography, Box, Button, Paper } from "@mui/material";
import ollamaLogo from "./assets/ollama_normal.svg";

export default function App() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <img
              src={ollamaLogo}
              alt="Ollama Logo"
              style={{ width: 32, height: 32 }}
            />
            <Typography
              variant="h6"
              sx={{
                color: "#212121",
                fontWeight: 500,
                fontSize: "1.125rem",
              }}
            >
              Ollama UI
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Button
              sx={{
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Chat
            </Button>
            <Button
              sx={{
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Models
            </Button>
            <Button
              sx={{
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Create
            </Button>
            <Button
              sx={{
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Settings
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Chat Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#fafafa",
        }}
      >
        {/* Empty chat area */}
      </Box>

      {/* Footer Status */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 1.5,
          backgroundColor: "white",
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* <Typography variant="body2" sx={{ color: "#666666" }}>
            Ollama running
          </Typography>
          <Typography variant="body2" sx={{ color: "#666666" }}>
            |
          </Typography>
          <Typography variant="body2" sx={{ color: "#666666" }}>
            Model: Llama3
          </Typography>
          <Typography variant="body2" sx={{ color: "#666666" }}>
            |
          </Typography>
          <Typography variant="body2" sx={{ color: "#666666" }}>
            Pulling: 43%
          </Typography> */}
        </Box>
      </Paper>
    </Box>
  );
}
