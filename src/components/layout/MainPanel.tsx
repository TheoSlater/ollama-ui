import { TabsContent } from "@/components/ui/tabs";
import CreatePanel from "@/create/CreatePanel";
import { ModelPanel } from "@/Models/ModelPanel";

export function MainPanel() {
  return (
    <div className="flex-1 bg-base-200/30">
      {/* <TabsContent value="chat" className="h-full m-0">
        <div className="h-full"></div>
      </TabsContent> */}

      <TabsContent value="models" className="h-full m-0">
        <div className="h-full">
          <ModelPanel />
        </div>
      </TabsContent>

      <TabsContent value="create" className="h-full m-0">
        <div className="h-full">{/* <CreatePanel /> */}</div>
      </TabsContent>

      <TabsContent value="settings" className="h-full m-0">
        <div className="h-full"></div>
      </TabsContent>
    </div>
  );
}
