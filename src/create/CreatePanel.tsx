import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function CreateModelPage() {
  const [modelName, setModelName] = useState("");
  const [modelfile, setModelfile] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleCreate = () => {
    setIsCreating(true);
    setLogs((prev) => [...prev, "Creating model..."]);
    // Add your model creation logic here
    setTimeout(() => {
      setIsCreating(false);
      setLogs((prev) => [...prev, "Model created!"]);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Create New Model</h2>

      <Input
        placeholder="Model name (e.g. my-jarvis)"
        value={modelName}
        onChange={(e) => setModelName(e.target.value)}
      />

      <Textarea
        placeholder="Enter your Modelfile here"
        value={modelfile}
        onChange={(e) => setModelfile(e.target.value)}
        rows={15}
        className="font-mono"
      />

      <Button
        onClick={handleCreate}
        disabled={!modelName || !modelfile || isCreating}
      >
        {isCreating ? "Creating..." : "Create Model"}
      </Button>
    </div>
  );
}
