import { useEffect, useRef } from "react";
import { useTerminal } from "@/hooks";
import "@xterm/xterm/css/xterm.css";

interface TerminalProps {
  className?: string;
}

export function Terminal({ className }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { initializeTerminal, fitTerminal, isInitialized } = useTerminal();

  // Initialize terminal when component mounts
  useEffect(() => {
    if (!terminalRef.current || isInitialized) return;

    initializeTerminal(terminalRef.current);

    // Fit terminal after a short delay
    const fitTimer = setTimeout(() => {
      fitTerminal();
    }, 50);

    // Handle window resize
    const handleResize = () => {
      fitTerminal();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(fitTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [initializeTerminal, fitTerminal, isInitialized]);

  // Fit terminal when container size changes
  useEffect(() => {
    if (isInitialized) {
      const timer = setTimeout(() => {
        fitTerminal();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [fitTerminal, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Note: We don't cleanup here to maintain terminal state
      // Cleanup is handled by the hook or parent component
    };
  }, []);

  return (
    <div className={`w-full h-full ${className || ""}`}>
      <div
        ref={terminalRef}
        className="w-full h-full p-2"
        style={{ minHeight: "200px" }}
      />
    </div>
  );
}

// Export cleanup function for app shutdown
export const cleanupTerminal = () => {
  // This is now handled by the useTerminal hook
  // But we keep this export for backward compatibility
};
