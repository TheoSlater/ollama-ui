import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Switch,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import { Save } from "@mui/icons-material";

export default function SettingsPanel() {
  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 500, color: "#212121" }}>
          Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<Save />}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(25,118,210,0.3)",
          }}
        >
          Save Settings
        </Button>
      </Box>

      <Paper
        elevation={1}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
            Ollama Configuration
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Ollama Host"
              defaultValue="http://localhost:11434"
              variant="outlined"
              size="small"
              sx={{
                width: "400px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              label="Default Model"
              defaultValue="llama3:latest"
              variant="outlined"
              size="small"
              sx={{
                width: "400px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Box>

        <List sx={{ p: 0 }}>
          <ListItem sx={{ py: 2, px: 3 }}>
            <ListItemText
              primary="Auto-start Ollama"
              secondary="Automatically start Ollama service when the app launches"
            />
            <Switch defaultChecked />
          </ListItem>

          <Divider />

          <ListItem sx={{ py: 2, px: 3 }}>
            <ListItemText
              primary="Show Terminal Output"
              secondary="Display terminal commands and output in the drawer"
            />
            <Switch defaultChecked />
          </ListItem>

          <Divider />

          <ListItem sx={{ py: 2, px: 3 }}>
            <ListItemText
              primary="Auto-pull Updates"
              secondary="Automatically check and pull model updates"
            />
            <Switch />
          </ListItem>

          <Divider />

          <ListItem sx={{ py: 2, px: 3 }}>
            <ListItemText
              primary="Dark Mode"
              secondary="Use dark theme for the interface"
            />
            <Switch />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
}
