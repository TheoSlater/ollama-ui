import { useState, useEffect, useCallback } from "react";
import {
  ollamaService,
  OllamaModel,
  PullProgress,
} from "../services/ollamaService";

export interface OllamaState {
  models: OllamaModel[];
  isOllamaRunning: boolean;
  activePulls: Map<string, PullProgress>;
  runningModels: Set<string>;
  loading: boolean;
  error: string | null;
}

export function useOllama() {
  const [state, setState] = useState<OllamaState>({
    models: [],
    isOllamaRunning: false,
    activePulls: new Map(),
    runningModels: new Set(),
    loading: true,
    error: null,
  });

  const refreshModels = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const [models, isRunning] = await Promise.all([
        ollamaService.listModels(),
        ollamaService.checkOllamaStatus(),
      ]);

      setState((prev) => ({
        ...prev,
        models,
        isOllamaRunning: isRunning,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as string,
        loading: false,
      }));
    }
  }, []);

  const pullModel = useCallback(
    async (modelName: string) => {
      setState((prev) => ({
        ...prev,
        activePulls: new Map(
          prev.activePulls.set(modelName, {
            model: modelName,
            status: "Starting...",
            progress: 0,
            completed: false,
          })
        ),
      }));

      await ollamaService.pullModel(modelName, (progress: PullProgress) => {
        setState((prev) => ({
          ...prev,
          activePulls: new Map(prev.activePulls.set(modelName, progress)),
        }));

        if (progress.completed) {
          // Remove from active pulls after a delay
          setTimeout(() => {
            setState((prev) => {
              const newActivePulls = new Map(prev.activePulls);
              newActivePulls.delete(modelName);
              return { ...prev, activePulls: newActivePulls };
            });
            ollamaService.removePullProgressCallback(modelName);
          }, 3000);

          // Refresh models list
          refreshModels();
        }
      });
    },
    [refreshModels]
  );

  const runModel = useCallback(async (modelName: string) => {
    try {
      setState((prev) => ({
        ...prev,
        runningModels: new Set([...prev.runningModels, modelName]),
      }));

      const result = await ollamaService.runModel(modelName);
      console.log("Model run result:", result);
    } catch (error) {
      console.error("Failed to run model:", error);
      setState((prev) => {
        const newRunningModels = new Set(prev.runningModels);
        newRunningModels.delete(modelName);
        return { ...prev, runningModels: newRunningModels };
      });
    }
  }, []);

  const deleteModel = useCallback(
    async (modelName: string) => {
      try {
        await ollamaService.deleteModel(modelName);
        await refreshModels();
      } catch (error) {
        console.error("Failed to delete model:", error);
        setState((prev) => ({ ...prev, error: error as string }));
      }
    },
    [refreshModels]
  );

  const getActiveProgress = useCallback(() => {
    const activeProgress = Array.from(state.activePulls.values()).find(
      (progress) => !progress.completed
    );

    return activeProgress;
  }, [state.activePulls]);

  // Initial load
  useEffect(() => {
    refreshModels();

    // Set up periodic status check
    const interval = setInterval(() => {
      ollamaService.checkOllamaStatus().then((isRunning) => {
        setState((prev) => ({ ...prev, isOllamaRunning: isRunning }));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshModels]);

  return {
    ...state,
    refreshModels,
    pullModel,
    runModel,
    deleteModel,
    getActiveProgress,
  };
}
