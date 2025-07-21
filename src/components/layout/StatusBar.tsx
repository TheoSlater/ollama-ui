// import { Progress } from "@/components/ui/progress";
import { SquareTerminal } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Terminal } from "@/components/terminal/Terminal";
import { useState } from "react";

export function StatusBar() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleOpenSheet = () => {
    setIsSheetOpen(true);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <footer className="px-6 py-2 bg-base-100 border-t border-base-300">
        <div className="flex items-center justify-between gap-4 text-sm text-base-content/70">
          <div className="flex items-center gap-4">
            {/* <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Ollama running
          </span>
          <span>Model: Llama3</span>
          <div className="flex items-center gap-2">
            <span>Pulling: 43%</span>
            <Progress value={43} className="w-20 h-1" />
          </div> */}
          </div>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleOpenSheet}
            >
              <SquareTerminal />
            </Button>
          </SheetTrigger>
        </div>
      </footer>
      <SheetContent side="bottom" className="h-1/2">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Terminal</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <Terminal />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
