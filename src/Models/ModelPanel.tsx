import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useOllama } from "@/hooks";
import { Loader2, RefreshCw, Trash2, Eye, Download } from "lucide-react";

export function ModelPanel() {
  const {
    models,
    loading,
    error,
    loadModelsWithDetails,
    removeModel,
    pullModel,
    getModelCount,
    getTotalSize,
  } = useOllama();

  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [pullModelName, setPullModelName] = useState("");
  const [isPulling, setIsPulling] = useState(false);

  const handleRefresh = async () => {
    try {
      await loadModelsWithDetails();
    } catch (err) {
      console.error("Failed to refresh models:", err);
    }
  };

  const handlePullModel = async () => {
    if (!pullModelName.trim()) {
      console.error("Please enter a model name");
      return;
    }

    setIsPulling(true);
    try {
      await pullModel(pullModelName.trim());
      setPullModelName("");
    } catch (err) {
      console.error("Failed to pull model:", err);
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
      // Clear selection if this model was selected
      if (selectedModel === modelName) {
        setSelectedModel(null);
      }
    } catch (err) {
      console.error("Failed to remove model:", err);
    }
  };

  const formatSize = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const formatDate = (dateString: string): string => {
    try {
      // If it's already a relative date like "2 months ago", return as is
      if (
        dateString.includes("ago") ||
        dateString.includes("day") ||
        dateString.includes("hour")
      ) {
        return dateString;
      }

      // Try to parse as a proper date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }

      // Fallback to original string
      return dateString;
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
          <Button
            className="btn"
            onClick={handleRefresh}
            variant="outline"
            disabled={loading}
          >
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
        <div className="flex gap-2 items-center">
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
            className="btn"
            variant={isPulling ? "secondary" : "default"}
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
                className={`p-4 rounded-lg border transition-colors hover:bg-base-200/50 cursor-pointer border-base-300`}
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
                      className="btn"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Show model details in a modal or something
                        console.log("Model details feature coming soon");
                      }}
                      disabled
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      className="btn"
                      size="sm"
                      variant="default"
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
