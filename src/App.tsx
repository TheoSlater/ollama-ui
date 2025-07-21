"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { Tabs } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { MainPanel } from "@/components/layout/MainPanel";
import { StatusBar } from "@/components/layout/StatusBar";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div data-theme="light" className="min-h-screen">
        <Tabs
          defaultValue="chat"
          className="flex flex-col h-screen bg-base-100"
        >
          <Header />
          <MainPanel />
          <StatusBar />
        </Tabs>
      </div>
    </ThemeProvider>
  );
}
