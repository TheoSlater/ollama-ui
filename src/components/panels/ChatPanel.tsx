import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Send, AttachFile, Mic } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import {
  OllamaModel,
  ollamaService,
  ChatMessage,
} from "../../services/ollamaService";

interface ChatPanelProps {
  models: OllamaModel[];
}

export default function ChatPanel({ models }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listenersSetUp = useRef(false);

  useEffect(() => {
    // Set default model
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].name);
    }
  }, [models, selectedModel]);

  useEffect(() => {
    // Setup chat response listener only once
    if (!listenersSetUp.current) {
      const setupChatListener = async () => {
        await ollamaService.listenForChatResponses((response) => {
          setMessages((prev) => [...prev, response]);
          setIsLoading(false);
        });

        await ollamaService.listenForChatErrors((error) => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Error: ${error}`,
            },
          ]);
          setIsLoading(false);
        });
      };

      setupChatListener();
      listenersSetUp.current = true;
    }
  }, []); // Empty dependency array - only run once

  useEffect(() => {
    // Auto-scroll to bottom
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedModel || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInputMessage("");

    try {
      await ollamaService.sendChatMessage(selectedModel, userMessage.content);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: Failed to send message - ${error}`,
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      {/* Model Selection */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Model</InputLabel>
          <Select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            label="Model"
          >
            {models.map((model) => (
              <MenuItem key={model.name} value={model.name}>
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Chat Messages Area */}
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
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "white",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 500, color: "#212121" }}>
            Chat {selectedModel && `- ${selectedModel}`}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 3,
            backgroundColor: "#fafafa",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{ color: "#666666", textAlign: "center" }}
              >
                Start a conversation with your AI model
              </Typography>
              {models.length > 0 && (
                <Typography
                  variant="body2"
                  sx={{ color: "#999999", textAlign: "center" }}
                >
                  Model: {selectedModel || "Select a model"}
                </Typography>
              )}
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {messages.map((message, index) => (
                <ListItem
                  key={index}
                  sx={{
                    mb: 2,
                    display: "block",
                    p: 0,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor:
                        message.role === "user" ? "#e3f2fd" : "#f5f5f5",
                      borderRadius: 2,
                      ml: message.role === "user" ? 4 : 0,
                      mr: message.role === "assistant" ? 4 : 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#666666",
                        textTransform: "capitalize",
                        fontWeight: 500,
                      }}
                    >
                      {message.role}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mt: 0.5,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {message.content}
                    </Typography>
                  </Paper>
                </ListItem>
              ))}
              {isLoading && (
                <ListItem sx={{ display: "block", p: 0 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 2,
                      mr: 4,
                    }}
                  >
                    <Typography variant="body1" sx={{ color: "#666666" }}>
                      Thinking...
                    </Typography>
                  </Paper>
                </ListItem>
              )}
              <div ref={messagesEndRef} />
            </List>
          )}
        </Box>
      </Paper>

      {/* Chat Input */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ p: 2, display: "flex", alignItems: "flex-end", gap: 1 }}>
          <IconButton size="small" sx={{ color: "#666666" }}>
            <AttachFile />
          </IconButton>

          <TextField
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
            placeholder={
              selectedModel ? "Type your message..." : "Select a model first..."
            }
            variant="outlined"
            size="small"
            disabled={!selectedModel || isLoading}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f8f9fa",
                "&:hover": {
                  backgroundColor: "#f0f1f2",
                },
                "&.Mui-focused": {
                  backgroundColor: "white",
                },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #e0e0e0",
              },
            }}
          />

          <IconButton size="small" sx={{ color: "#666666" }}>
            <Mic />
          </IconButton>

          <IconButton
            onClick={handleSendMessage}
            disabled={!selectedModel || !inputMessage.trim() || isLoading}
            size="small"
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              "&:disabled": {
                backgroundColor: "#cccccc",
                color: "#666666",
              },
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}
