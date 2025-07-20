import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { Delete, PlayArrow, Refresh } from "@mui/icons-material";
import { useState } from "react";
import { OllamaModel } from "../../services/ollamaService";

interface ModelsPanelProps {
  models: OllamaModel[];
  onPullModel: (modelName: string) => Promise<void>;
  onRunModel: (modelName: string) => Promise<void>;
  onDeleteModel: (modelName: string) => Promise<void>;
  onRefreshModels: () => Promise<void>;
}

export default function ModelsPanel({
  models,
  onPullModel,
  onRunModel,
  onDeleteModel,
  onRefreshModels,
}: ModelsPanelProps) {
  const [pullDialogOpen, setPullDialogOpen] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePullModel = async () => {
    if (!newModelName.trim()) return;

    setLoading(true);
    try {
      await onPullModel(newModelName.trim());
      setPullDialogOpen(false);
      setNewModelName("");
    } catch (error) {
      console.error("Failed to pull model:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunModel = async (modelName: string) => {
    try {
      await onRunModel(modelName);
    } catch (error) {
      console.error("Failed to run model:", error);
    }
  };

  const handleDeleteModel = async (modelName: string) => {
    if (window.confirm(`Are you sure you want to delete ${modelName}?`)) {
      try {
        await onDeleteModel(modelName);
      } catch (error) {
        console.error("Failed to delete model:", error);
      }
    }
  };

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
          Available Models ({models.length})
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRefreshModels}
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={() => setPullDialogOpen(true)}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(25,118,210,0.3)",
            }}
          >
            Pull Model
          </Button>
        </Box>
      </Box>

      <Paper
        elevation={1}
        sx={{
          flex: 1,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {models.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "200px",
              color: "#666666",
            }}
          >
            <Typography variant="body1">
              No models found. Pull a model to get started.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {models.map((model, index) => (
              <ListItem
                key={model.name}
                sx={{
                  py: 2,
                  px: 3,
                  borderBottom:
                    index < models.length - 1 ? "1px solid #f0f0f0" : "none",
                  "&:hover": {
                    backgroundColor: "#f8f9fa",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {model.name}
                      </Typography>
                      <Chip
                        label="ready"
                        color="success"
                        size="small"
                        sx={{ fontSize: "0.75rem", height: 20 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ color: "#666666" }}>
                        ID: {model.id} • Size: {model.size} • Modified:{" "}
                        {model.modified}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      edge="end"
                      size="small"
                      sx={{ color: "#1976d2" }}
                      onClick={() => handleRunModel(model.name)}
                      title="Run Model"
                    >
                      <PlayArrow />
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      sx={{ color: "#d32f2f" }}
                      onClick={() => handleDeleteModel(model.name)}
                      title="Delete Model"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Pull Model Dialog */}
      <Dialog
        open={pullDialogOpen}
        onClose={() => setPullDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Pull Model</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Model Name"
            placeholder="e.g., llama3:latest, mistral:7b, codellama:13b"
            fullWidth
            variant="outlined"
            value={newModelName}
            onChange={(e) => setNewModelName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" sx={{ mt: 2, color: "#666666" }}>
            Enter the model name and tag (e.g., llama3:latest). You can find
            available models at{" "}
            <a
              href="https://ollama.com/search"
              target="_blank"
              rel="noopener noreferrer"
            >
              ollama.com/search
            </a>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPullDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePullModel}
            variant="contained"
            disabled={loading || !newModelName.trim()}
          >
            {loading ? "Pulling..." : "Pull"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
