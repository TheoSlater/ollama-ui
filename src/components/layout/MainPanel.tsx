import { TabsContent } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import { runShellCommand } from "@/api/terminal";

async function handleListModels() {
  try {
    await runShellCommand("ollama", ["list"]);
    console.log("Ollama list command executed");
  } catch (error) {
    console.error("Error executing ollama list:", error);
  }
}

export function MainPanel() {
  return (
    <div className="flex-1 bg-base-200/30">
      {/* <TabsContent value="chat" className="h-full m-0">
        <div className="h-full"></div>
      </TabsContent> */}

      <TabsContent value="models" className="h-full m-0">
        <div className="h-full">
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-base-content/70">
              Models will be displayed here.
            </p>
            <Button onClick={handleListModels}>List Installed Models</Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="create" className="h-full m-0">
        <div className="h-full"></div>
      </TabsContent>

      <TabsContent value="settings" className="h-full m-0">
        <div className="h-full"></div>
      </TabsContent>
    </div>
  );
}
