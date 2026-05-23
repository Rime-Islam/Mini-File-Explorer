import { useState } from "react";
import { Search, Grid3x3, List, Plus } from "lucide-react";
import { useOutletFileSystem } from "@/hooks/useOutletFileSystem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { NodeType } from "@/types";
import { CreateItemModal } from "@/components/modal/CreateModal";

const Home = () => {
  const fs = useOutletFileSystem();
  const { activeFolder, breadcrumbs } = fs;

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleCreate(name: string, type: NodeType) {
    fs.createNode(activeFolder.id, name, type);
  }

  return (
    <div className="flex flex-col h-full">
      {/* top bar */}
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-2 bg-slate-900 px-3 py-2 rounded border border-slate-800">
            <Search className="h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 text-sm placeholder:text-slate-600 focus-visible:ring-0 h-auto p-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  className="h-8 w-8 p-0"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid view</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  className="h-8 w-8 p-0"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List view</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="h-8 px-3 gap-1 text-xs"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="h-3 w-3" /> New
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create new item</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* breadcrumb */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/50 text-xs text-slate-500">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.id} className="flex items-center gap-1.5">
            {i > 0 && <span>/</span>}
            <button
              className="hover:text-slate-200 transition-colors"
              onClick={() => fs.navigateTo(crumb.id)}
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      {/* content placeholder */}
      <div className="flex-1 p-6">
        <p className="text-sm text-muted-foreground mb-4">
          Viewing:{" "}
          <span className="text-foreground font-medium">{activeFolder.name}</span>
          {" "}· {activeFolder.children.length} items
        </p>
        <ul className="flex flex-col gap-1">
          {activeFolder.children.map((child) => (
            <li
              key={child.id}
              className="text-sm px-3 py-2 rounded-md hover:bg-accent cursor-pointer"
              onClick={() => fs.handleNodeClick(child)}
            >
              {child.type === "folder" ? "📁" : "📄"} {child.name}
            </li>
          ))}
        </ul>
      </div>

      {/* create modal */}
      <CreateItemModal
        open={dialogOpen}
        parentFolderName={activeFolder.name}
        onOpenChange={setDialogOpen}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default Home;