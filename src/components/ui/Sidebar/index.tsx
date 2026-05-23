import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";

import { TreeNode } from "./TreeNode";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Clock,
  FolderPlus,
  HardDrive,
  Star,
  Trash2,
  Sparkles,
  X,
} from "lucide-react";
import type { FolderNode, NodeType } from "@/types";
import { CreateItemModal } from "@/components/modal/CreateModal";
import { useIsMobile } from "@/components/hooks/use-mobile";

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

  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleNavigate = useCallback(
    (id: string) => {
      onNavigate(id);
      if (isMobile) setMobileOpen(false);
    },
    [isMobile, onNavigate],
  );

  const handleOpenFile = useCallback(
    (id: string) => {
      onOpenFile(id);
      if (isMobile) setMobileOpen(false);
    },
    [isMobile, onOpenFile],
  );

  useEffect(() => {
    if (!sidebarRef.current || isMobile) return;
    gsap.fromTo(
      sidebarRef.current,
      { x: -16, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
    );
  }, [isMobile]);

  useEffect(() => {
    if (!sidebarRef.current || !isMobile) return;
    if (mobileOpen) {
      gsap.fromTo(
        sidebarRef.current,
        { x: "-100%" },
        { x: "0%", duration: 0.3, ease: "power2.out" },
      );
    } else {
      gsap.to(sidebarRef.current, {
        x: "-100%",
        duration: 0.25,
        ease: "power2.in",
      });
    }
  }, [mobileOpen, isMobile]);

  useEffect(() => {
    if (!treeRef.current) return;
    if (isMobile && !mobileOpen) return;
    const rows = treeRef.current.querySelectorAll(".tree-row");
    gsap.fromTo(
      rows,
      { x: -8, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.2,
        stagger: 0.03,
        ease: "power2.out",
        delay: 0.1,
      },
    );
  }, [mobileOpen, isMobile]);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
            <HardDrive className="w-3 h-3 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-800">
            Explorer
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md hover:bg-slate-200/50 transition-colors"
                onClick={() => setHeaderModalOpen(true)}
                aria-label="New item in current folder"
              >
                <FolderPlus
                  className="w-3.5 h-3.5 text-slate-600"
                  strokeWidth={2.5}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-[11px]">
              New item
            </TooltipContent>
          </Tooltip>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md hover:bg-slate-200/50 transition-colors"
              onClick={closeMobile}
              aria-label="Close sidebar"
            >
              <X className="w-3.5 h-3.5 text-slate-600" strokeWidth={2.5} />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 py-2">
        <div ref={treeRef} className="px-2.5">
          <div className="tree-row">
            <TreeNode
              node={root}
              depth={0}
              activeFolderId={activeFolderId}
              selectedId={selectedId}
              onNavigate={handleNavigate}
              onToggle={onToggleFolder}
              onOpenFile={handleOpenFile}
              onCreateNode={onCreateNode}
              onRename={onRename}
              onDelete={onDelete}
            />
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-white/10 px-3.5 py-3">
        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2 px-1">
          Quick access
        </p>
        <div className="flex flex-col gap-0.5">
          {QUICK_ACCESS.map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              onClick={() => isMobile && setMobileOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-slate-700 hover:bg-white/60 hover:shadow-sm hover:border hover:border-white/20 transition-all duration-200 cursor-pointer w-full text-left group"
            >
              <Icon
                className={`w-3.5 h-3.5 ${color} group-hover:scale-110 transition-transform`}
                strokeWidth={2.5}
              />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 bg-white/30 px-4 py-2.5 flex items-center gap-2">
        <Sparkles className="w-3 h-3 text-amber-600" strokeWidth={2.5} />
        <span className="text-[10px] text-slate-600 truncate">
          Active:{" "}
          <span className="font-semibold text-slate-800">
            {activeFolderName}
          </span>
        </span>
      </div>

      <CreateItemModal
        open={headerModalOpen}
        parentFolderName={activeFolderName}
        onOpenChange={setHeaderModalOpen}
        onCreate={(name, type) => onCreateNode(activeFolderId, name, type)}
      />
    </>
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-30 h-9 w-9 rounded-lg bg-white/80 backdrop-blur-sm border border-white/20 shadow-md hover:bg-white/90 transition-colors"
          aria-label="Open sidebar"
        >
          <HardDrive className="w-4 h-4 text-slate-700" strokeWidth={2.5} />
        </Button>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={closeMobile}
          />
        )}

        <aside
          ref={sidebarRef}
          className={`fixed top-0 left-0 z-50 flex flex-col w-[260px] h-full bg-white/95 backdrop-blur-md border-r border-white/10 shadow-xl -translate-x-full`}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside
      ref={sidebarRef}
      className="flex flex-col w-[240px] min-w-[240px] h-full bg-white/60 backdrop-blur-sm border-r border-white/10"
    >
      {sidebarContent}
    </aside>
  );
}
