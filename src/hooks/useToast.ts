import { useState, useCallback } from "react";

interface ToastState {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

/**
 * Simple toast/notification hook for better user feedback
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((toast: Omit<ToastState, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, description?: string) => {
      return showToast({ title, description, type: "success" });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, description?: string) => {
      return showToast({ title, description, type: "error" });
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      return showToast({ title, description, type: "warning" });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, description?: string) => {
      return showToast({ title, description, type: "info" });
    },
    [showToast]
  );

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clearAll,
  };
}
