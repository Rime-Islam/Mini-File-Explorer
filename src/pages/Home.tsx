import { useState, useEffect, useRef } from "react";
import {
  Search,
  Grid3x3,
  List,
  Plus,
  Folder,
  FileText,
  FolderOpen,
  Pencil,
  Trash2,
  MoreHorizontal,
  HardDrive,
  FolderPlus,
  Save,
  X,
  RotateCcw,
  CheckCircle2,
  AlignLeft,
  Hash,
  Type,
} from "lucide-react";
import gsap from "gsap";
import { useOutletFileSystem } from "@/hooks/useOutletFileSystem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NodeType, TextFileNode, FileSystemNode } from "@/types";
import { CreateItemModal } from "@/components/modal/CreateModal";
import { RenameModal } from "@/components/modal/RenameModal";
import { DeleteModal } from "@/components/modal/DeleteModal";
import { cn } from "@/lib/utils";

function isTextFile(node: FileSystemNode): node is TextFileNode {
  return node.type === "textfile";
}

type ModalState =
  | { type: "none" }
  | { type: "create"; targetId: string }
  | { type: "rename"; targetId: string }
  | { type: "delete"; targetId: string };

function TextEditor({
  file,
  onSave,
  onClose,
}: {
  file: TextFileNode;
  onSave: (id: string, content: string) => void;
  onClose: () => void;
}) {
  const [content, setContent] = useState(file.content);
  const [savedContent, setSavedContent] = useState(file.content);
  const [justSaved, setJustSaved] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDirty = content !== savedContent;

  useEffect(() => {
    setContent(file.content);
    setSavedContent(file.content);
    setJustSaved(false);
  }, [file.id]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    gsap.fromTo(
      wrapperRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
    );
    setTimeout(() => textareaRef.current?.focus(), 150);
  }, [file.id]);

  function save() {
    onSave(file.id, content);
    setSavedContent(content);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      save();
    }
  }

  const lines = content.split("\n").length;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div ref={wrapperRef} className="flex flex-col flex-1 min-h-0 bg-white">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg">
          <FileText
            className="w-3.5 h-3.5 text-blue-500 flex-shrink-0"
            strokeWidth={2.2}
          />
          <span className="text-xs font-semibold text-slate-700 max-w-[200px] truncate">
            {file.name}
          </span>
          {isDirty && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          )}
        </div>

        <div className="flex-1" />

        {justSaved && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
            Saved
          </span>
        )}

        {isDirty && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 gap-1.5"
            onClick={() => setContent(savedContent)}
          >
            <RotateCcw className="w-3 h-3" strokeWidth={2.5} />
            Discard
          </Button>
        )}

        <Button
          size="sm"
          disabled={!isDirty}
          onClick={save}
          className={cn(
            "h-8 px-3.5 text-xs font-semibold gap-1.5 shadow-sm",
            isDirty
              ? "bg-slate-900 hover:bg-slate-700 text-white"
              : "bg-slate-100 text-slate-400",
          )}
        >
          <Save className="w-3 h-3" strokeWidth={2.5} />
          Save
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          onClick={onClose}
          title="Back to folder"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
        </Button>
      </div>

        <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder="Start typing…"
        className="flex-1 w-full resize-none outline-none bg-white text-slate-800 font-mono text-sm leading-7 px-6 py-5 placeholder:text-slate-300"
      />

      <div className="flex items-center gap-4 px-5 py-2 border-t border-slate-100 bg-slate-50 flex-shrink-0">
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <AlignLeft className="w-3 h-3" strokeWidth={2} />
          {lines} line{lines !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <Type className="w-3 h-3" strokeWidth={2} />
          {words} word{words !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <Hash className="w-3 h-3" strokeWidth={2} />
          {chars} char{chars !== 1 ? "s" : ""}
        </span>
        <span className="ml-auto text-[11px]">
          {isDirty ? (
            <span className="text-amber-500 font-medium">
              Unsaved · Ctrl+S to save
            </span>
          ) : (
            <span className="text-slate-400">Plain text · UTF-8</span>
          )}
        </span>
      </div>
    </div>
  );
}


const Home = () => {
  const fs = useOutletFileSystem();
  const { activeFolder, breadcrumbs, selectedId } = fs;
  const openFile = selectedId
    ? (getNodeById(selectedId) as FileSystemNode | null)
    : null;

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const contentRef = useRef<HTMLDivElement>(null);

  const isViewingFile = openFile !== null && isTextFile(openFile);

  const filteredChildren = activeFolder.children.filter((child) =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const folderCount = activeFolder.children.filter(
    (c) => c.type === "folder",
  ).length;
  const fileCount = activeFolder.children.filter(
    (c) => c.type === "textfile",
  ).length;
  const isSearching = searchQuery.trim().length > 0;
  const filteredFolderCount = filteredChildren.filter(
    (c) => c.type === "folder",
  ).length;
  const filteredFileCount = filteredChildren.filter(
    (c) => c.type === "textfile",
  ).length;

  function handleOpenFolder(id: string) {
    fs.navigateTo(id);
    fs.toggleFolder(id);
    fs.openFile(null);
  }

  function handleOpenFile(id: string) {
    fs.openFile(id);
  }

  function handleNodeClick(child: FileSystemNode) {
    if (child.type === "folder") {
      handleOpenFolder(child.id);
    } else {
      handleOpenFile(child.id);
    }
  }

  function getNodeById(id: string): any {
    const find = (node: any): any => {
      if (node.id === id) return node;
      for (const child of node.children || []) {
        const found = find(child);
        if (found) return found;
      }
      return null;
    };
    return find(fs.root);
  }

  function handleCreate(name: string, type: NodeType) {
    if (modal.type === "create") fs.createNode(modal.targetId, name, type);
    setModal({ type: "none" });
  }

  function handleRename(newName: string) {
    if (modal.type === "rename") fs.renameNode(modal.targetId, newName);
    setModal({ type: "none" });
  }

  function handleDelete() {
    if (modal.type === "delete") fs.deleteNode(modal.targetId);
    setModal({ type: "none" });
  }

  useEffect(() => {
    if (!contentRef.current) return;
    const items = contentRef.current.querySelectorAll("[data-item]");
    gsap.fromTo(
      items,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.045, ease: "power2.out" },
    );
  }, [activeFolder.id, searchQuery]);

  useEffect(() => {
    gsap.fromTo(
      ".file-manager-header",
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
    );
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="file-manager-header border-b border-slate-200/60 bg-white/80 backdrop-blur-sm px-5 py-3.5 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-sm">
            <Search className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
            <Input
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-0 h-auto p-0"
            />
            {isSearching && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[10px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {!isViewingFile && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "h-7 w-7 p-0 rounded-md transition-all",
                        viewMode === "grid"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800",
                      )}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3x3 className="h-3.5 w-3.5" strokeWidth={2.2} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-[11px]">
                    Grid view
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "h-7 w-7 p-0 rounded-md transition-all",
                        viewMode === "list"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800",
                      )}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-3.5 w-3.5" strokeWidth={2.2} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-[11px]">
                    List view
                  </TooltipContent>
                </Tooltip>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 px-3.5 gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                    onClick={() =>
                      setModal({ type: "create", targetId: activeFolder.id })
                    }
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> New
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-[11px]">
                  Create new item
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-slate-200/60 bg-white/40 backdrop-blur-sm px-5 py-2.5 flex-shrink-0">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, i) => (
              <BreadcrumbItem key={crumb.id}>
                {i > 0 && <BreadcrumbSeparator />}
                {i === breadcrumbs.length - 1 && !isViewingFile ? (
                  <BreadcrumbPage className="text-slate-800 font-medium text-xs">
                    {crumb.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button
                      className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                      onClick={() => {
                        fs.navigateTo(crumb.id);
                        fs.openFile(null);
                      }}
                    >
                      {crumb.name}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            ))}
            {isViewingFile && openFile && (
              <BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbPage className="text-slate-800 font-medium text-xs truncate max-w-[160px]">
                  {openFile.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {isViewingFile && isTextFile(openFile) ? (
        <TextEditor
          file={openFile}
          onSave={fs.updateFileContent}
          onClose={() => fs.openFile(null)}
        />
      ) : (
        <div ref={contentRef} className="flex-1 p-5 overflow-auto">
          {filteredChildren.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FolderPlus
                  className="w-6 h-6 text-slate-400"
                  strokeWidth={1.8}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">
                  {isSearching ? "No results found" : "This folder is empty"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {isSearching
                    ? `No items match "${searchQuery}"`
                    : "Click + New to create a folder or file"}
                </p>
              </div>
              {!isSearching && (
                <Button
                  size="sm"
                  className="mt-1 h-8 px-3.5 gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                  onClick={() =>
                    setModal({ type: "create", targetId: activeFolder.id })
                  }
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> New item
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredChildren.map((child) => (
                <div key={child.id} data-item className="group cursor-pointer">
                  <div
                    onClick={() => handleNodeClick(child)}
                    className="relative h-[130px] bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex flex-col items-center justify-center gap-2"
                  >
                    <div
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-md hover:bg-slate-200"
                          >
                            <MoreHorizontal
                              className="h-3.5 w-3.5 text-slate-500"
                              strokeWidth={2.5}
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 shadow-xl"
                        >
                          {child.type === "folder" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleOpenFolder(child.id)}
                                className="gap-2 text-xs"
                              >
                                <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                                Open folder
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setModal({
                                    type: "create",
                                    targetId: child.id,
                                  })
                                }
                                className="gap-2 text-xs"
                              >
                                <Plus className="w-3.5 h-3.5 text-amber-500" />
                                New item inside
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {child.type === "textfile" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleOpenFile(child.id)}
                                className="gap-2 text-xs"
                              >
                                <FileText className="w-3.5 h-3.5 text-blue-500" />
                                Open file
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              setModal({ type: "rename", targetId: child.id })
                            }
                            className="gap-2 text-xs"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-500" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setModal({ type: "delete", targetId: child.id })
                            }
                            className="gap-2 text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {child.type === "folder" ? (
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-200">
                        <Folder
                          className="h-5 w-5 text-amber-500"
                          strokeWidth={2.2}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-200">
                        <FileText
                          className="h-5 w-5 text-blue-500"
                          strokeWidth={2.2}
                        />
                      </div>
                    )}

                    <p className="text-[12px] font-medium text-slate-700 text-center truncate w-full px-1">
                      {child.name}
                    </p>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                      {child.type === "folder" ? "Folder" : "Text file"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredChildren.map((child) => (
                <div key={child.id} data-item className="group cursor-pointer">
                  <div
                    onClick={() => handleNodeClick(child)}
                    className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-slate-50 transition-all duration-150"
                  >
                    {child.type === "folder" ? (
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center flex-shrink-0">
                        <Folder
                          className="h-4 w-4 text-amber-500"
                          strokeWidth={2.2}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center flex-shrink-0">
                        <FileText
                          className="h-4 w-4 text-blue-500"
                          strokeWidth={2.2}
                        />
                      </div>
                    )}

                    <span className="text-sm font-medium text-slate-700 flex-1 truncate">
                      {child.name}
                    </span>

                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                      {child.type === "folder" ? "Folder" : "Text file"}
                    </span>

                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-md hover:bg-slate-200"
                          >
                            <MoreHorizontal
                              className="h-4 w-4 text-slate-500"
                              strokeWidth={2.5}
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 shadow-xl"
                        >
                          {child.type === "folder" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleOpenFolder(child.id)}
                                className="gap-2 text-xs"
                              >
                                <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                                Open folder
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setModal({
                                    type: "create",
                                    targetId: child.id,
                                  })
                                }
                                className="gap-2 text-xs"
                              >
                                <Plus className="w-3.5 h-3.5 text-amber-500" />
                                New item inside
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {child.type === "textfile" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleOpenFile(child.id)}
                                className="gap-2 text-xs"
                              >
                                <FileText className="w-3.5 h-3.5 text-blue-500" />
                                Open file
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              setModal({ type: "rename", targetId: child.id })
                            }
                            className="gap-2 text-xs"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-500" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setModal({ type: "delete", targetId: child.id })
                            }
                            className="gap-2 text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isViewingFile && (
        <div className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm px-5 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">
              {isSearching
                ? filteredChildren.length
                : activeFolder.children.length}{" "}
              item
              {activeFolder.children.length !== 1 ? "s" : ""}
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Folder className="w-3 h-3 text-amber-500" strokeWidth={2.5} />
              {isSearching ? filteredFolderCount : folderCount} folder
              {folderCount !== 1 ? "s" : ""}
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-blue-500" strokeWidth={2.5} />
              {isSearching ? filteredFileCount : fileCount} file
              {fileCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <HardDrive className="w-3 h-3" strokeWidth={2} />
            <span>Saved to localStorage</span>
          </div>
        </div>
      )}

      {modal.type === "create" && (
        <CreateItemModal
          open
          parentFolderName={
            getNodeById(modal.targetId)?.name || activeFolder.name
          }
          onOpenChange={(open) => {
            if (!open) setModal({ type: "none" });
          }}
          onCreate={handleCreate}
        />
      )}
      {modal.type === "rename" && (
        <RenameModal
          open
          currentName={getNodeById(modal.targetId)?.name || ""}
          nodeType={getNodeById(modal.targetId)?.type || "textfile"}
          onOpenChange={(open) => {
            if (!open) setModal({ type: "none" });
          }}
          onRename={handleRename}
        />
      )}
      {modal.type === "delete" && (
        <DeleteModal
          open
          nodeName={getNodeById(modal.targetId)?.name || ""}
          nodeType={getNodeById(modal.targetId)?.type || "textfile"}
          childCount={getNodeById(modal.targetId)?.children?.length || 0}
          onOpenChange={(open) => {
            if (!open) setModal({ type: "none" });
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default Home;
