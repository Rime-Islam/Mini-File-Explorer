import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

import { TreeNode } from "./TreeNode";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Clock, FolderPlus, HardDrive, Star, Trash2 } from "lucide-react";
import type { FolderNode, NodeType } from "@/types";
import { CreateItemModal } from "@/components/modal/CreateModal";

interface SidebarProps {
  root: FolderNode;
  activeFolderId: string;
  activeFolderName: string;
  selectedId: string | null;
  onNavigate: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onOpenFile: (id: string) => void;
  onCreateNode: (parentId: string, name: string, type: NodeType) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

const QUICK_ACCESS = [
  { icon: Clock, label: "Recent" },
  { icon: Star, label: "Starred" },
  { icon: Trash2, label: "Trash" },
];

export function Sidebar({
  root,
  activeFolderId,
  activeFolderName,
  selectedId,
  onNavigate,
  onToggleFolder,
  onOpenFile,
  onCreateNode,
  onRename,
  onDelete,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  // Header + button opens modal scoped to the active folder
  const [headerModalOpen, setHeaderModalOpen] = useState(false);

  useEffect(() => {
    if (!sidebarRef.current) return;
    gsap.fromTo(
      sidebarRef.current,
      { x: -16, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    if (!treeRef.current) return;
    const rows = treeRef.current.querySelectorAll(".tree-row");
    gsap.fromTo(
      rows,
      { x: -8, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.2, stagger: 0.03, ease: "power2.out", delay: 0.1 }
    );
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className="flex flex-col w-[220px] min-w-[220px] border-r bg-muted/40 h-full"
    >
      {/* ── header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b">
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            Explorer
          </span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setHeaderModalOpen(true)}
              aria-label="New item in current folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">New item</TooltipContent>
        </Tooltip>
      </div>

      {/* ── tree ─────────────────────────────────────────── */}
      <ScrollArea className="flex-1 py-1.5">
        <div ref={treeRef} className="px-2">
          <div className="tree-row">
            <TreeNode
              node={root}
              depth={0}
              activeFolderId={activeFolderId}
              selectedId={selectedId}
              onNavigate={onNavigate}
              onToggle={onToggleFolder}
              onOpenFile={onOpenFile}
              onCreateNode={onCreateNode}  // passes the raw action down
              onRename={onRename}
              onDelete={onDelete}
            />
          </div>
        </div>
      </ScrollArea>

      {/* ── quick access ──────────────────────────────────── */}
      <div className="border-t px-3 py-2.5">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">
          Quick access
        </p>
        <div className="flex flex-col gap-0.5">
          {QUICK_ACCESS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer w-full text-left"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Header-level modal — creates in the currently active folder */}
      <CreateItemModal
        open={headerModalOpen}
        parentFolderName={activeFolderName}
        onOpenChange={setHeaderModalOpen}
        onCreate={(name, type) => onCreateNode(activeFolderId, name, type)}
      />
    </aside>
  );
}