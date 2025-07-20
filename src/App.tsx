"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import Header from "./components/layout/Header";
import MainPanel from "./components/layout/MainPanel";
import StatusBar from "./components/layout/StatusBar";
import TerminalDrawer from "./components/layout/TerminalDrawer";
import { useOllama } from "./hooks/useOllama";

export default function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [terminalOpen, setTerminalOpen] = useState(false);

  const {
    isOllamaRunning,
    models,
    getActiveProgress,
    pullModel,
    runModel,
    deleteModel,
    refreshModels,
  } = useOllama();

  const activeProgress = getActiveProgress();
  const currentModel = models.length > 0 ? models[0].name : undefined;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleTerminalToggle = () => {
    setTerminalOpen(!terminalOpen);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header currentTab={currentTab} onTabChange={handleTabChange} />

      <MainPanel
        currentTab={currentTab}
        models={models}
        onPullModel={pullModel}
        onRunModel={runModel}
        onDeleteModel={deleteModel}
        onRefreshModels={refreshModels}
      />

      <StatusBar
        isOllamaRunning={isOllamaRunning}
        currentModel={currentModel}
        activeCommand={activeProgress?.status}
        progress={activeProgress?.progress}
        onTerminalToggle={handleTerminalToggle}
      />

      <TerminalDrawer
        open={terminalOpen}
        onOpen={() => setTerminalOpen(true)}
        onClose={() => setTerminalOpen(false)}
      />
    </Box>
  );
}
