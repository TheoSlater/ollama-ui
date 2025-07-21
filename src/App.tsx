"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import { Tabs } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { MainPanel } from "@/components/layout/MainPanel";
import { StatusBar } from "@/components/layout/StatusBar";
import { StartupAnimation } from "@/components/startup/StartupAnimation";
import { cleanupTerminal } from "@/components/terminal/Terminal";

export default function App() {
  const [showStartup, setShowStartup] = useState(true);
  const [showMainApp, setShowMainApp] = useState(false);

  useEffect(() => {
    // Cleanup terminal on app unmount
    return () => {
      cleanupTerminal();
    };
  }, []);

  const handleStartupComplete = () => {
    setShowStartup(false);
    setShowMainApp(true);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {showStartup && (
        <StartupAnimation onComplete={handleStartupComplete} disabled />
      )}

      {showMainApp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          data-theme="light"
          className="min-h-screen"
        >
          <Tabs
            defaultValue="chat"
            className="flex flex-col h-screen bg-base-100"
          >
            <Header />
            <MainPanel />
            <StatusBar />
          </Tabs>
        </motion.div>
      )}
    </ThemeProvider>
  );
}
