import { AppBar, Toolbar, Typography, Box, Tabs, Tab } from "@mui/material";
import ollamaLogo from "../../assets/ollama_normal.svg";

interface HeaderProps {
  currentTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const tabLabels = ["Chat", "Models", "Modelfile", "Settings"];

export default function Header({ currentTab, onTabChange }: HeaderProps) {
  return (
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

        <Tabs
          value={currentTab}
          onChange={onTabChange}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              color: "#666666",
              "&.Mui-selected": {
                color: "#1976d2",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#1976d2",
              borderRadius: "2px 2px 0 0",
            },
          }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}
