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
  Folder,
  FileText,
  Pencil,
  Trash2,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import type { FileSystemNode, FolderNode } from "@/types";
import { formatSize, isFolder } from "@/utils/treeHelpers";

interface FileGridProps {
  folder: FolderNode;
  selectedId: string | null;
  viewMode: "grid" | "list";
  searchQuery: string;
  onOpenFolder: (id: string) => void;
  onOpenFile: (id: string) => void;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function FileGrid({
  folder,
  selectedId,
  viewMode,
  searchQuery,
  onOpenFolder,
  onOpenFile,
  onSelect,
  onRename,
  onDelete,
}: FileGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const items = searchQuery.trim()
    ? folder.children.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : folder.children;

  const folders = items.filter(isFolder);
  const files = items.filter((c) => !isFolder(c));

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".file-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 10, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.22,
        stagger: 0.03,
        ease: "power2.out",
        clearProps: "transform",
      },
    );
  }, [folder.id, viewMode]);

  function handleDoubleClick(node: FileSystemNode) {
    if (isFolder(node)) {
      onOpenFolder(node.id);
    } else {
      onOpenFile(node.id);
    }
  }

  function handleSingleClick(node: FileSystemNode) {
    onSelect(node.id);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 text-slate-600 py-20">
        <FolderOpen className="w-10 h-10 opacity-30" />
        <p className="text-sm">
          {searchQuery ? "No results found" : "This folder is empty"}
        </p>
        {!searchQuery && (
          <p className="text-xs text-slate-700">
            Click <span className="text-slate-500">+ New</span> to add something
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={gridRef} className="flex flex-col gap-6">
      {folders.length > 0 && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2 px-1">
            Folders
          </p>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
              {folders.map((node) => (
                <GridCard
                  key={node.id}
                  node={node}
                  isSelected={node.id === selectedId}
                  onClick={() => handleSingleClick(node)}
                  onDoubleClick={() => handleDoubleClick(node)}
                  onRename={() => onRename(node.id, node.name)}
                  onDelete={() => onDelete(node.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {folders.map((node) => (
                <ListRow
                  key={node.id}
                  node={node}
                  isSelected={node.id === selectedId}
                  onClick={() => handleSingleClick(node)}
                  onDoubleClick={() => handleDoubleClick(node)}
                  onRename={() => onRename(node.id, node.name)}
                  onDelete={() => onDelete(node.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {files.length > 0 && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2 px-1">
            Files
          </p>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
              {files.map((node) => (
                <GridCard
                  key={node.id}
                  node={node}
                  isSelected={node.id === selectedId}
                  onClick={() => handleSingleClick(node)}
                  onDoubleClick={() => handleDoubleClick(node)}
                  onRename={() => onRename(node.id, node.name)}
                  onDelete={() => onDelete(node.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {files.map((node) => (
                <ListRow
                  key={node.id}
                  node={node}
                  isSelected={node.id === selectedId}
                  onClick={() => handleSingleClick(node)}
                  onDoubleClick={() => handleDoubleClick(node)}
                  onRename={() => onRename(node.id, node.name)}
                  onDelete={() => onDelete(node.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

interface CardProps {
  node: FileSystemNode;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

function withContextMenu(children: React.ReactNode, props: CardProps) {
  const folder = isFolder(props.node);
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children as React.ReactElement}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44 bg-slate-900 border-slate-800 text-slate-200">
        <ContextMenuItem
          className="focus:bg-slate-800 focus:text-slate-100"
          onClick={props.onDoubleClick}
        >
          {folder ? (
            <FolderOpen className="w-3.5 h-3.5 mr-2 text-amber-400" />
          ) : (
            <FileText className="w-3.5 h-3.5 mr-2 text-blue-400" />
          )}
          {folder ? "Open folder" : "Open file"}
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-slate-800" />
        <ContextMenuItem
          className="focus:bg-slate-800 focus:text-slate-100"
          onClick={props.onRename}
        >
          <Pencil className="w-3.5 h-3.5 mr-2" />
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-slate-800" />
        <ContextMenuItem
          className="text-red-400 focus:bg-slate-800 focus:text-red-400"
          onClick={props.onDelete}
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          {folder ? "Delete folder" : "Delete file"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function GridCard(props: CardProps) {
  const { node, isSelected, onClick, onDoubleClick } = props;
  const folder = isFolder(node);

  const card = (
    <div
      className={cn(
        "file-card flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer select-none group transition-all duration-150",
        isSelected
          ? folder
            ? "border-amber-500/40 bg-amber-500/10"
            : "border-blue-500/40 bg-blue-500/10"
          : "border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800/60",
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
          isSelected
            ? folder
              ? "bg-amber-500/20"
              : "bg-blue-500/20"
            : "bg-slate-800 group-hover:bg-slate-700",
        )}
      >
        {folder ? (
          <Folder className="w-5 h-5 text-amber-400" />
        ) : (
          <FileText className="w-5 h-5 text-blue-400" />
        )}
      </div>

      <span className="text-[11px] text-slate-300 text-center leading-tight break-all line-clamp-2 w-full">
        {node.name}
      </span>

      {!folder && (node as any).size !== undefined && (
        <span className="text-[9px] text-slate-600">
          {formatSize((node as any).size)}
        </span>
      )}
      {folder && (
        <span className="text-[9px] text-slate-600">
          {(node as FolderNode).children.length} item
          {(node as FolderNode).children.length !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );

  return withContextMenu(card, props);
}

function ListRow(props: CardProps) {
  const { node, isSelected, onClick, onDoubleClick } = props;
  const folder = isFolder(node);

  const row = (
    <div
      className={cn(
        "file-card flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer select-none group transition-all duration-150",
        isSelected
          ? folder
            ? "border-amber-500/40 bg-amber-500/10"
            : "border-blue-500/40 bg-blue-500/10"
          : "border-transparent hover:border-slate-800 hover:bg-slate-900",
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {folder ? (
        <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
      ) : (
        <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
      )}

      <span className="flex-1 text-sm text-slate-300 truncate">
        {node.name}
      </span>

      <span className="text-[10px] text-slate-600 min-w-[48px] text-right">
        {folder ? "Folder" : "Text file"}
      </span>

      <span className="text-[10px] text-slate-600 min-w-[48px] text-right">
        {folder
          ? `${(node as FolderNode).children.length} items`
          : formatSize((node as any).size ?? 0)}
      </span>

      <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 transition-colors" />
    </div>
  );

  return withContextMenu(row, props);
}
