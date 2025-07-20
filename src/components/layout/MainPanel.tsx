import { Box, Container, Fade } from "@mui/material";
import ChatPanel from "../panels/ChatPanel";
import ModelsPanel from "../panels/ModelsPanel";
import ModelfilePanel from "../panels/ModelfilePanel";
import SettingsPanel from "../panels/SettingsPanel";
import { OllamaModel } from "../../services/ollamaService";

interface MainPanelProps {
  currentTab: number;
  models: OllamaModel[];
  onPullModel: (modelName: string) => Promise<void>;
  onRunModel: (modelName: string) => Promise<void>;
  onDeleteModel: (modelName: string) => Promise<void>;
  onRefreshModels: () => Promise<void>;
}

export default function MainPanel({
  currentTab,
  models,
  onPullModel,
  onRunModel,
  onDeleteModel,
  onRefreshModels,
}: MainPanelProps) {
  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return <ChatPanel models={models} />;
      case 1:
        return (
          <ModelsPanel
            models={models}
            onPullModel={onPullModel}
            onRunModel={onRunModel}
            onDeleteModel={onDeleteModel}
            onRefreshModels={onRefreshModels}
          />
        );
      case 2:
        return <ModelfilePanel />;
      case 3:
        return <SettingsPanel />;
      default:
        return <ChatPanel models={models} />;
    }
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        backgroundColor: "#fafafa",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          height: "100%",
          py: 3,
          px: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Fade in={true} timeout={300}>
          <Box
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            {renderTabContent()}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
