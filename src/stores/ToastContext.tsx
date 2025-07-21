import { createContext, useContext, ReactNode } from "react";
import { useToast } from "@/hooks/useToast";

type ToastContextType = ReturnType<typeof useToast>;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Render toasts */}
      {toast.toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {toast.toasts.map((toastItem) => (
            <div
              key={toastItem.id}
              className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-200 ${
                toastItem.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : toastItem.type === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : toastItem.type === "warning"
                  ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{toastItem.title}</h4>
                {toastItem.description && (
                  <p className="text-sm opacity-80 mt-1">
                    {toastItem.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => toast.removeToast(toastItem.id)}
                className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
