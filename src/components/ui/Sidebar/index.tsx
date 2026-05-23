import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

import { TreeNode } from "./TreeNode";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Clock, FolderPlus, HardDrive, Star, Trash2, Sparkles } from "lucide-react";
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
  { icon: Clock, label: "Recent", color: "text-slate-600" },
  { icon: Star, label: "Starred", color: "text-amber-600" },
  { icon: Trash2, label: "Trash", color: "text-red-500" },
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
      className="flex flex-col w-[240px] min-w-[240px] h-full bg-white/60 backdrop-blur-sm border-r border-white/10"
    >
      {/* ── header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
            <HardDrive className="w-3 h-3 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-800">
            Explorer
          </span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md hover:bg-slate-200/50 transition-colors"
              onClick={() => setHeaderModalOpen(true)}
              aria-label="New item in current folder"
            >
              <FolderPlus className="w-3.5 h-3.5 text-slate-600" strokeWidth={2.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-[11px]">New item</TooltipContent>
        </Tooltip>
      </div>

      {/* ── tree ─────────────────────────────────────────── */}
      <ScrollArea className="flex-1 py-2">
        <div ref={treeRef} className="px-2.5">
          <div className="tree-row">
            <TreeNode
              node={root}
              depth={0}
              activeFolderId={activeFolderId}
              selectedId={selectedId}
              onNavigate={onNavigate}
              onToggle={onToggleFolder}
              onOpenFile={onOpenFile}
              onCreateNode={onCreateNode}
              onRename={onRename}
              onDelete={onDelete}
            />
          </div>
        </div>
      </ScrollArea>

      {/* ── quick access ──────────────────────────────────── */}
      <div className="border-t border-white/10 px-3.5 py-3">
        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2 px-1">
          Quick access
        </p>
        <div className="flex flex-col gap-0.5">
          {QUICK_ACCESS.map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-slate-700 hover:bg-white/60 hover:shadow-sm hover:border hover:border-white/20 transition-all duration-200 cursor-pointer w-full text-left group"
            >
              <Icon className={`w-3.5 h-3.5 ${color} group-hover:scale-110 transition-transform`} strokeWidth={2.5} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── active folder indicator ──────────────────────── */}
      <div className="border-t border-white/10 bg-white/30 px-4 py-2.5 flex items-center gap-2">
        <Sparkles className="w-3 h-3 text-amber-600" strokeWidth={2.5} />
        <span className="text-[10px] text-slate-600 truncate">
          Active: <span className="font-semibold text-slate-800">{activeFolderName}</span>
        </span>
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