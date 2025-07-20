import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { Save, PlayArrow } from "@mui/icons-material";

export default function ModelfilePanel() {
  const sampleModelfile = `FROM llama3:latest

# Set the temperature to 1 [higher is more creative, lower is more coherent]
PARAMETER temperature 1

# Set the system message
SYSTEM """
You are Mario from Super Mario Bros. Answer as Mario, the cheerful Italian plumber. 
Always be enthusiastic and use phrases like "Mamma mia!", "Let's-a go!", and "Wahoo!"
"""`;

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
          Create Modelfile
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Save />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(25,118,210,0.3)",
            }}
          >
            Create Model
          </Button>
        </Box>
      </Box>

      <Paper
        elevation={1}
        sx={{
          flex: 1,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid #e0e0e0" }}>
          <TextField
            label="Model Name"
            placeholder="my-custom-model"
            variant="outlined"
            size="small"
            sx={{
              width: "300px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        <Divider />

        <Box sx={{ flex: 1, p: 0 }}>
          <TextField
            multiline
            placeholder="Enter your Modelfile content..."
            defaultValue={sampleModelfile}
            variant="outlined"
            sx={{
              width: "100%",
              height: "100%",
              "& .MuiOutlinedInput-root": {
                height: "100%",
                borderRadius: 0,
                border: "none",
                fontFamily: "monospace",
                fontSize: "0.875rem",
                "& fieldset": {
                  border: "none",
                },
              },
              "& .MuiInputBase-input": {
                height: "100% !important",
                padding: "16px",
                lineHeight: 1.6,
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
