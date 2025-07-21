import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import ollamaNormal from "@/assets/ollama_normal.svg";

export function Header() {
  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-6 py-3">
      <div className="navbar-start">
        <div className="flex items-center gap-2">
          <img src={ollamaNormal} alt="Ollama Logo" className="w-10 h-10" />
          <span className="text-lg font-medium">Ollama UI</span>
        </div>
      </div>

      <div className="navbar-end">
        <TabsList className="bg-transparent border-none p-0 h-auto space-x-5">
          {/* <TabsTrigger
            value="chat"
            className="data-[state=active]:bg-base-200 data-[state=active]:text-base-content bg-transparent text-base-content/70 hover:text-base-content hover:bg-base-200/50"
          >
            Chat
          </TabsTrigger> */}
          <TabsTrigger
            value="models"
            className="data-[state=active]:bg-base-200 data-[state=active]:text-base-content bg-transparent text-base-content/70 hover:text-base-content hover:bg-base-200/50"
          >
            Models
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="data-[state=active]:bg-base-200 data-[state=active]:text-base-content bg-transparent text-base-content/70 hover:text-base-content hover:bg-base-200/50"
          >
            Create
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-base-200 data-[state=active]:text-base-content bg-transparent text-base-content/70 hover:text-base-content hover:bg-base-200/50"
          >
            Settings
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
}
