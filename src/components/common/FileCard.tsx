import { useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Folder, FolderOpen, FileText, Pencil, Trash2, ExternalLink } from "lucide-react";
import type { FileSystemNode, FolderNode } from "@/types";
import { formatSize, isFolder } from "@/utils/Treehelpers";

interface FileCardProps {
  node: FileSystemNode;
  isSelected: boolean;
  viewMode: "grid" | "list";
  onClick: () => void;
  onDoubleClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function FileCard({
  node,
  isSelected,
  viewMode,
  onClick,
  onDoubleClick,
  onRename,
  onDelete,
}: FileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const folder = isFolder(node) ? (node as FolderNode) : null;

  function handleClick() {
    // GSAP micro-press
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { scale: 0.96 }, { scale: 1, duration: 0.2, ease: "back.out(2)" });
    }
    onClick();
  }

  const itemCount = folder ? folder.children.length : null;
  const fileSize = !folder ? formatSize((node as any).size ?? 0) : null;

  if (viewMode === "grid") {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={cardRef}
            className={cn(
              "group relative flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer select-none transition-colors",
              "hover:border-slate-600 hover:bg-slate-800/60",
              isSelected
                ? "border-blue-500/60 bg-blue-500/10"
                : "border-slate-800 bg-slate-900/40"
            )}
            onClick={handleClick}
            onDoubleClick={onDoubleClick}
          >
            {/* icon */}
            {folder ? (
              isSelected ? (
                <FolderOpen className="w-10 h-10 text-amber-400 flex-shrink-0" />
              ) : (
                <Folder className="w-10 h-10 text-amber-400 flex-shrink-0" />
              )
            ) : (
              <FileText className="w-10 h-10 text-blue-400 flex-shrink-0" />
            )}

            {/* name */}
            <span className="text-[11px] text-slate-200 text-center leading-tight break-all line-clamp-2 w-full">
              {node.name}
            </span>

            {/* meta */}
            <span className="text-[10px] text-slate-500">
              {folder ? `${itemCount} item${itemCount !== 1 ? "s" : ""}` : fileSize}
            </span>

            {/* hover actions */}
            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
              <button
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700"
                onClick={(e) => { e.stopPropagation(); onRename(); }}
                title="Rename"
              >
                <Pencil className="w-2.5 h-2.5 text-slate-400" />
              </button>
              <button
                className="p-1 rounded bg-slate-800 hover:bg-red-900/60 border border-slate-700 hover:border-red-700"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                title="Delete"
              >
                <Trash2 className="w-2.5 h-2.5 text-slate-400 hover:text-red-400" />
              </button>
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-44 bg-slate-900 border-slate-700">
          <ContextMenuItem
            className="text-slate-200 focus:bg-slate-800 focus:text-slate-100"
            onClick={onDoubleClick}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-2" />
            {folder ? "Open folder" : "Open file"}
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-slate-700" />
          <ContextMenuItem
            className="text-slate-200 focus:bg-slate-800 focus:text-slate-100"
            onClick={onRename}
          >
            <Pencil className="w-3.5 h-3.5 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-slate-700" />
          <ContextMenuItem
            className="text-red-400 focus:bg-red-950 focus:text-red-300"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            {folder ? "Delete folder" : "Delete file"}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={cardRef}
          className={cn(
            "group flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer select-none transition-colors",
            "hover:border-slate-700 hover:bg-slate-800/60",
            isSelected
              ? "border-blue-500/40 bg-blue-500/10"
              : "border-transparent"
          )}
          onClick={handleClick}
          onDoubleClick={onDoubleClick}
        >
          {folder ? (
            <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
          )}

          <span className="flex-1 text-sm text-slate-200 truncate">{node.name}</span>

          <span className="text-xs text-slate-500 w-16 text-right flex-shrink-0">
            {folder ? `${itemCount} item${itemCount !== 1 ? "s" : ""}` : fileSize}
          </span>

          <span className="text-[10px] text-slate-600 w-14 text-right flex-shrink-0 uppercase tracking-wide">
            {folder ? "Folder" : "Text"}
          </span>

          {/* hover actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
            <button
              className="p-1 rounded hover:bg-slate-700"
              onClick={(e) => { e.stopPropagation(); onRename(); }}
              title="Rename"
            >
              <Pencil className="w-3 h-3 text-slate-400" />
            </button>
            <button
              className="p-1 rounded hover:bg-red-900/40"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Delete"
            >
              <Trash2 className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-44 bg-slate-900 border-slate-700">
        <ContextMenuItem
          className="text-slate-200 focus:bg-slate-800 focus:text-slate-100"
          onClick={onDoubleClick}
        >
          <ExternalLink className="w-3.5 h-3.5 mr-2" />
          {folder ? "Open folder" : "Open file"}
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-slate-700" />
        <ContextMenuItem
          className="text-slate-200 focus:bg-slate-800 focus:text-slate-100"
          onClick={onRename}
        >
          <Pencil className="w-3.5 h-3.5 mr-2" />
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-slate-700" />
        <ContextMenuItem
          className="text-red-400 focus:bg-red-950 focus:text-red-300"
          onClick={onDelete}
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          {folder ? "Delete folder" : "Delete file"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}