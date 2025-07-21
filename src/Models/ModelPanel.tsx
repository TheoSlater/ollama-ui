import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useOllama } from "@/hooks";
import { useToastContext } from "@/stores/ToastContext";
import { Loader2, RefreshCw, Trash2, Eye, Download } from "lucide-react";

export function ModelPanel() {
  const {
    models,
    loading,
    error,
    loadModels,
    removeModel,
    pullModel,
    listModelsInTerminal,
    getModelCount,
    getTotalSize,
  } = useOllama();

  const { success, error: showError } = useToastContext();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [pullModelName, setPullModelName] = useState("");
  const [isPulling, setIsPulling] = useState(false);

  const handleRefresh = async () => {
    try {
      await loadModels();
      success("Models refreshed successfully");
    } catch (err) {
      showError(
        "Failed to refresh models",
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  };

  const handleShowInTerminal = async () => {
    try {
      await listModelsInTerminal();
      success("Command sent to terminal");
    } catch (err) {
      showError(
        "Failed to execute command",
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  };

  const handlePullModel = async () => {
    if (!pullModelName.trim()) {
      showError("Please enter a model name");
      return;
    }

    setIsPulling(true);
    try {
      await pullModel(pullModelName.trim());
      success(`Successfully pulled ${pullModelName}`);
      setPullModelName("");
    } catch (err) {
      showError(
        "Failed to pull model",
        err instanceof Error ? err.message : "Unknown error"
      );
    } finally {
      setIsPulling(false);
    }
  };

  const handleRemoveModel = async (modelName: string) => {
    if (!confirm(`Are you sure you want to remove ${modelName}?`)) {
      return;
    }

    try {
      await removeModel(modelName);
      success(`Successfully removed ${modelName}`);
      // Clear selection if this model was selected
      if (selectedModel === modelName) {
        setSelectedModel(null);
      }
    } catch (err) {
      showError(
        "Failed to remove model",
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  };

  const formatSize = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading && models.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg text-base-content/70">
            Loading models...
          </span>
        </div>
      </div>
    );
  }

  if (error && models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-2">Error loading models</p>
          <p className="text-sm text-base-content/70">{error}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-base-content">
            Ollama Models
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            {getModelCount()} models • {formatSize(getTotalSize())} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleShowInTerminal} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Show in Terminal
          </Button>
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Pull Model Section */}
      <div className="mb-6 p-4 border border-base-300 rounded-lg bg-base-100">
        <h3 className="text-lg font-medium mb-3">Pull New Model</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter model name (e.g., llama3:latest)"
            value={pullModelName}
            onChange={(e) => setPullModelName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handlePullModel();
              }
            }}
            disabled={isPulling}
          />
          <Button
            onClick={handlePullModel}
            disabled={isPulling || !pullModelName.trim()}
          >
            {isPulling ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isPulling ? "Pulling..." : "Pull"}
          </Button>
        </div>
      </div>

      {/* Models List */}
      {models.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-base-content mb-2">
              No models found
            </h3>
            <p className="text-base-content/70">
              Pull your first model to get started
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="grid gap-4">
            {models.map((model) => (
              <div
                key={model.name}
                className={`p-4 rounded-lg border transition-colors hover:bg-base-200/50 cursor-pointer ${
                  selectedModel === model.name
                    ? "border-primary bg-base-200/30"
                    : "border-base-300"
                }`}
                onClick={() =>
                  setSelectedModel(
                    selectedModel === model.name ? null : model.name
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-base-content">
                      {model.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-base-content/70">
                      <span>{formatSize(model.size)}</span>
                      <span>Modified: {formatDate(model.modified_at)}</span>
                      <span className="font-mono text-xs bg-base-200 px-2 py-1 rounded">
                        {model.digest.slice(0, 12)}...
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Show model details in a modal
                        showError(
                          "Feature coming soon",
                          "Model details view is not implemented yet"
                        );
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveModel(model.name);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {selectedModel === model.name && (
                  <div className="mt-3 pt-3 border-t border-base-300">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Family:</span>
                        <span className="ml-2 text-base-content/70">
                          {model.details.family}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Format:</span>
                        <span className="ml-2 text-base-content/70">
                          {model.details.format}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Parameter Size:</span>
                        <span className="ml-2 text-base-content/70">
                          {model.details.parameter_size}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Quantization:</span>
                        <span className="ml-2 text-base-content/70">
                          {model.details.quantization_level}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
