// import { Progress } from "@/components/ui/progress";
import { SquareTerminal } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Terminal</h2>
        </div>
      </SheetContent>
    </Sheet>
  );
}
