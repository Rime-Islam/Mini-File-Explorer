import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import type { FileSystemNode, FolderNode } from "@/types";

interface TreeNodeProps {
  node: FileSystemNode;
  depth: number;
  activeFolderId: string;
  selectedId: string | null;
  onNavigate: (id: string) => void;
  onToggle: (id: string) => void;
  onOpenFile: (id: string) => void;
  onCreateIn: (parentId: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function TreeNode({
  node,
  depth,
  activeFolderId,
  selectedId,
  onNavigate,
  onToggle,
  onOpenFile,
  onCreateIn,
  onRename,
  onDelete,
}: TreeNodeProps) {
  const childrenRef = useRef<HTMLDivElement>(null);
  const folder = node.type === "folder" ? (node as FolderNode) : null;
  const isActive = node.id === activeFolderId;
  const isSelected = node.id === selectedId;
  const isExpanded = folder?.isExpanded ?? false;

  // GSAP: animate children open/close
  useEffect(() => {
    const el = childrenRef.current;
    if (!el || !folder) return;

    if (isExpanded) {
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.22, ease: "power2.out" }
      );
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.18,
        ease: "power2.in",
      });
    }
  }, [isExpanded]);

  function handleClick() {
    if (folder) {
      onToggle(node.id);
      onNavigate(node.id);
    } else {
      onOpenFile(node.id);
    }
  }

  const paddingLeft = 10 + depth * 14;

  const rowContent = (
    <div
      className={cn(
        "group flex items-center gap-1.5 py-[5px] pr-2 rounded-md cursor-pointer select-none text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground font-medium",
        isSelected && !isActive && "bg-muted"
      )}
      style={{ paddingLeft }}
      onClick={handleClick}
    >
      {/* chevron */}
      {folder ? (
        <span className="text-muted-foreground w-3.5 flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </span>
      ) : (
        <span className="w-3.5 flex-shrink-0" />
      )}

      {/* icon */}
      {folder ? (
        isExpanded ? (
          <FolderOpen className="w-4 h-4 flex-shrink-0 text-amber-400" />
        ) : (
          <Folder className="w-4 h-4 flex-shrink-0 text-amber-400" />
        )
      ) : (
        <FileText className="w-4 h-4 flex-shrink-0 text-blue-400" />
      )}

      {/* name */}
      <span className="flex-1 truncate text-[12.5px]">{node.name}</span>

      {/* child count badge */}
      {folder && folder.children.length > 0 && !isExpanded && (
        <span className="text-[10px] bg-muted text-muted-foreground rounded px-1 py-0.5 leading-none">
          {folder.children.length}
        </span>
      )}

      {/* inline + button on hover */}
      {folder && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-border"
              onClick={(e) => {
                e.stopPropagation();
                onCreateIn(node.id);
              }}
              aria-label={`New item in ${node.name}`}
            >
              <Plus className="w-3 h-3 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">New item</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>{rowContent}</ContextMenuTrigger>
        <ContextMenuContent className="w-44">
          {folder && (
            <ContextMenuItem onClick={() => onCreateIn(node.id)}>
              <Plus className="w-3.5 h-3.5 mr-2" />
              New item inside
            </ContextMenuItem>
          )}
          {!folder && (
            <ContextMenuItem onClick={() => onOpenFile(node.id)}>
              <FileText className="w-3.5 h-3.5 mr-2" />
              Open file
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onRename(node.id, node.name)}>
            <Pencil className="w-3.5 h-3.5 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => onDelete(node.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            {folder ? "Delete folder" : "Delete file"}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* children — GSAP controls height */}
      {folder && (
        <div
          ref={childrenRef}
          style={{ overflow: "hidden", height: isExpanded ? "auto" : 0 }}
        >
          {folder.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeFolderId={activeFolderId}
              selectedId={selectedId}
              onNavigate={onNavigate}
              onToggle={onToggle}
              onOpenFile={onOpenFile}
              onCreateIn={onCreateIn}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}