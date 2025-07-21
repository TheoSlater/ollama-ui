import { useCallback, useEffect } from "react";
import { ollamaService } from "@/services/ollama";
import { useAppContext } from "@/stores/AppContext";
import { useCommand } from "./useCommand";

/**
 * Hook for managing Ollama models and operations
 */
export function useOllama() {
  const { state, dispatch } = useAppContext();
  const { execute: executeCommand, isLoading: commandLoading } = useCommand();

  // Load models
  const loadModels = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const models = await ollamaService.listModels();
      dispatch({ type: "SET_MODELS", payload: models });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load models";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [dispatch]);

  // Pull a model
  const pullModel = useCallback(
    async (modelName: string) => {
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        await ollamaService.pullModel(modelName);
        // Reload models after successful pull
        await loadModels();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to pull model";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        throw error;
      }
    },
    [dispatch, loadModels]
  );

  // Remove a model
  const removeModel = useCallback(
    async (modelName: string) => {
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        await ollamaService.removeModel(modelName);
        dispatch({ type: "REMOVE_MODEL", payload: modelName });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to remove model";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        throw error;
      }
    },
    [dispatch]
  );

  // Show model details
  const showModel = useCallback(
    async (modelName: string) => {
      try {
        return await ollamaService.showModel(modelName);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to show model details";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        throw error;
      }
    },
    [dispatch]
  );

  // Check Ollama status
  const checkStatus = useCallback(async () => {
    try {
      return await ollamaService.checkStatus();
    } catch (error) {
      console.error("Failed to check Ollama status:", error);
      return false;
    }
  }, []);

  // List models using terminal command (shows in terminal)
  const listModelsInTerminal = useCallback(async () => {
    return executeCommand("ollama", ["list"]);
  }, [executeCommand]);

  // Auto-load models on mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  return {
    // State
    models: state.models,
    loading: state.loading || commandLoading,
    error: state.error,

    // Actions
    loadModels,
    pullModel,
    removeModel,
    showModel,
    checkStatus,
    listModelsInTerminal,

    // Helpers
    getModelByName: (name: string) =>
      state.models.find((model) => model.name === name),
    getModelCount: () => state.models.length,
    getTotalSize: () =>
      state.models.reduce((total, model) => total + model.size, 0),
  };
}
