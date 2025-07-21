import { TabsContent } from "@/components/ui/tabs";

export function MainPanel() {
  return (
    <div className="flex-1 bg-base-200/30">
      <TabsContent value="chat" className="h-full m-0">
        <div className="h-full"></div>
      </TabsContent>

      <TabsContent value="models" className="h-full m-0">
        <div className="h-full"></div>
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
