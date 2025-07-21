import React, { createContext, useContext, useReducer, ReactNode } from "react";
import type { AppState, OllamaModel } from "@/types";

// Define action types
type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_MODELS"; payload: OllamaModel[] }
  | { type: "ADD_MODEL"; payload: OllamaModel }
  | { type: "REMOVE_MODEL"; payload: string }
  | { type: "SET_TERMINAL_INITIALIZED"; payload: boolean }
  | { type: "SET_CURRENT_COMMAND"; payload: string }
  | { type: "ADD_TO_HISTORY"; payload: string }
  | { type: "CLEAR_HISTORY" };

// Initial state
const initialState: AppState = {
  models: [],
  loading: false,
  error: null,
  terminal: {
    isInitialized: false,
    currentCommand: "",
    history: [],
  },
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_MODELS":
      return { ...state, models: action.payload };

    case "ADD_MODEL":
      return {
        ...state,
        models: [...state.models, action.payload],
      };

    case "REMOVE_MODEL":
      return {
        ...state,
        models: state.models.filter((model) => model.name !== action.payload),
      };

    case "SET_TERMINAL_INITIALIZED":
      return {
        ...state,
        terminal: {
          ...state.terminal,
          isInitialized: action.payload,
        },
      };

    case "SET_CURRENT_COMMAND":
      return {
        ...state,
        terminal: {
          ...state.terminal,
          currentCommand: action.payload,
        },
      };

    case "ADD_TO_HISTORY":
      return {
        ...state,
        terminal: {
          ...state.terminal,
          history: [...state.terminal.history, action.payload],
        },
      };

    case "CLEAR_HISTORY":
      return {
        ...state,
        terminal: {
          ...state.terminal,
          history: [],
        },
      };

    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the app context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

// Export action types for use in hooks
export type { AppAction };
