import { useRef, useEffect, useState } from "react";
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
import type { FileSystemNode, FolderNode, NodeType } from "@/types";
import { CreateItemModal } from "@/components/modal/CreateModal";
import { RenameModal } from "@/components/modal/RenameModal";
import { DeleteModal } from "@/components/modal/DeleteModal";

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "rename" }
  | { type: "delete" };

interface TreeNodeProps {
  node: FileSystemNode;
  depth: number;
  activeFolderId: string;
  selectedId: string | null;
  onNavigate: (id: string) => void;
  onToggle: (id: string) => void;
  onOpenFile: (id: string) => void;
  onCreateNode: (parentId: string, name: string, type: NodeType) => void;
  onRename: (id: string, newName: string) => void;
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
  onCreateNode,
  onRename,
  onDelete,
}: TreeNodeProps) {
  const childrenRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const folder = node.type === "folder" ? (node as FolderNode) : null;
  const isActive = node.id === activeFolderId;
  const isSelected = node.id === selectedId;
  const isExpanded = folder?.isExpanded ?? false;

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

  // ── click handlers ────────────────────────────────────────────────────────
  function handleRowClick() {
    if (folder) {
      onToggle(node.id);
      onNavigate(node.id);
    } else {
      onOpenFile(node.id);
    }
  }

  function openCreate(e?: React.MouseEvent) {
    e?.stopPropagation();
    setModal({ type: "create" });
  }

  function openRename(e?: React.MouseEvent) {
    e?.stopPropagation();
    setModal({ type: "rename" });
  }

  function openDelete(e?: React.MouseEvent) {
    e?.stopPropagation();
    setModal({ type: "delete" });
  }

  function closeModal() {
    setModal({ type: "none" });
  }

  // ── modal action callbacks ─────────────────────────────────────────────────
  function handleCreate(name: string, type: NodeType) {
    onCreateNode(node.id, name, type);
  }

  function handleRename(newName: string) {
    onRename(node.id, newName);
  }

  function handleDelete() {
    onDelete(node.id);
  }

  // ── layout ────────────────────────────────────────────────────────────────
  const paddingLeft = 10 + depth * 16;

  const rowContent = (
    <div
      className={cn(
        "group flex items-center gap-1.5 py-[6px] pr-2 rounded-lg cursor-pointer select-none text-sm transition-all duration-200",
        "hover:bg-white/60 hover:shadow-sm hover:border hover:border-white/30",
        isActive && "bg-white/70 shadow-sm border border-amber-200/50 font-medium",
        isSelected && !isActive && "bg-white/40 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
      )}
      style={{ paddingLeft }}
      onClick={handleRowClick}
    >
      {/* chevron — only for folders */}
      {folder ? (
        <span className="w-4 flex-shrink-0 flex items-center justify-center">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-slate-500" strokeWidth={2.5} />
          ) : (
            <ChevronRight className="w-3 h-3 text-slate-500" strokeWidth={2.5} />
          )}
        </span>
      ) : (
        <span className="w-4 flex-shrink-0" />
      )}

      {/* icon */}
      {folder ? (
        isExpanded ? (
          <FolderOpen className="w-4 h-4 flex-shrink-0 text-amber-600" strokeWidth={2.2} />
        ) : (
          <Folder className="w-4 h-4 flex-shrink-0 text-amber-500" strokeWidth={2.2} />
        )
      ) : (
        <FileText className="w-4 h-4 flex-shrink-0 text-blue-600" strokeWidth={2.2} />
      )}

      {/* name */}
      <span
        className={cn(
          "flex-1 truncate text-[12.5px] transition-colors",
          isActive ? "text-slate-900" : "text-slate-700"
        )}
      >
        {node.name}
      </span>

      {/* child count badge — folders only, when collapsed */}
      {folder && folder.children.length > 0 && !isExpanded && (
        <span className="text-[10px] bg-slate-100 text-slate-600 rounded-md px-1.5 py-0.5 leading-none font-medium border border-slate-200/50">
          {folder.children.length}
        </span>
      )}

      {/* hover action buttons */}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
        {/* + new item — folders only */}
        {folder && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-1 rounded-md hover:bg-amber-100/60 transition-colors"
                onClick={openCreate}
                aria-label={`New item in ${node.name}`}
              >
                <Plus className="w-3 h-3 text-amber-700" strokeWidth={2.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-[11px]">New item</TooltipContent>
          </Tooltip>
        )}

        {/* rename */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-1 rounded-md hover:bg-slate-200/60 transition-colors"
              onClick={openRename}
              aria-label={`Rename ${node.name}`}
            >
              <Pencil className="w-3 h-3 text-slate-600" strokeWidth={2.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-[11px]">Rename</TooltipContent>
        </Tooltip>

        {/* delete */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-1 rounded-md hover:bg-red-100/60 transition-colors"
              onClick={openDelete}
              aria-label={`Delete ${node.name}`}
            >
              <Trash2 className="w-3 h-3 text-slate-500 hover:text-red-600" strokeWidth={2.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-[11px]">Delete</TooltipContent>
        </Tooltip>
      </span>
    </div>
  );

  return (
    <div>
      {/* ── row with context menu ─────────────────────────────────────────── */}
      <ContextMenu>
        <ContextMenuTrigger asChild>{rowContent}</ContextMenuTrigger>

        <ContextMenuContent className="w-48 bg-white/90 backdrop-blur-lg border-white/20 shadow-xl">
          {/* folder-only: open & new item */}
          {folder && (
            <>
              <ContextMenuItem onClick={() => { onNavigate(node.id); onToggle(node.id); }} className="gap-2">
                <FolderOpen className="w-3.5 h-3.5 text-amber-600" strokeWidth={2.2} />
                Open folder
              </ContextMenuItem>
              <ContextMenuItem onClick={() => openCreate()} className="gap-2">
                <Plus className="w-3.5 h-3.5 text-amber-600" strokeWidth={2.5} />
                New item inside
              </ContextMenuItem>
            </>
          )}

          {/* file-only: open */}
          {!folder && (
            <ContextMenuItem onClick={() => onOpenFile(node.id)} className="gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-600" strokeWidth={2.2} />
              Open file
            </ContextMenuItem>
          )}

          <ContextMenuSeparator className="bg-slate-200/50" />

          <ContextMenuItem onClick={() => openRename()} className="gap-2">
            <Pencil className="w-3.5 h-3.5 text-slate-600" strokeWidth={2.5} />
            Rename
          </ContextMenuItem>

          <ContextMenuSeparator className="bg-slate-200/50" />

          <ContextMenuItem
            onClick={() => openDelete()}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 gap-2"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" strokeWidth={2.5} />
            {folder ? "Delete folder" : "Delete file"}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* ── children ─────────────────────────────────────────────────────── */}
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
              onCreateNode={onCreateNode}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* create — only for folders */}
      {folder && (
        <CreateItemModal
          open={modal.type === "create"}
          parentFolderName={node.name}
          onOpenChange={(open) => !open && closeModal()}
          onCreate={handleCreate}
        />
      )}

      {/* rename — folders and files */}
      <RenameModal
        open={modal.type === "rename"}
        currentName={node.name}
        nodeType={node.type}
        onOpenChange={(open) => !open && closeModal()}
        onRename={handleRename}
      />

      {/* delete — folders and files */}
      <DeleteModal
        open={modal.type === "delete"}
        nodeName={node.name}
        nodeType={node.type}
        childCount={folder?.children.length ?? 0}
        onOpenChange={(open) => !open && closeModal()}
        onConfirm={handleDelete}
      />
    </div>
  );
}