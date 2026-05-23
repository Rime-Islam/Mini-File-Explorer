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
import type { NodeType } from "@/types";
import { CreateItemModal } from "@/components/modal/CreateModal";
import { RenameModal } from "@/components/modal/RenameModal";
import { DeleteModal } from "@/components/modal/DeleteModal";
import { cn } from "@/lib/utils";

type ModalState =
  | { type: "none"; targetId?: string }
  | { type: "create"; targetId: string }
  | { type: "rename"; targetId: string }
  | { type: "delete"; targetId: string };

const Home = () => {
  const fs = useOutletFileSystem();
  const { activeFolder, breadcrumbs } = fs;

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const contentRef = useRef<HTMLDivElement>(null);

  function handleCreate(name: string, type: NodeType) {
    if (modal.type === "create") {
      fs.createNode(modal.targetId, name, type);
    }
  }

  function handleRename(newName: string) {
    if (modal.type === "rename") {
      fs.renameNode(modal.targetId, newName);
    }
  }

  function handleDelete() {
    if (modal.type === "delete") {
      fs.deleteNode(modal.targetId);
    }
  }

  function openCreateModal(parentId: string) {
    setModal({ type: "create", targetId: parentId });
  }

  function openRenameModal(nodeId: string) {
    setModal({ type: "rename", targetId: nodeId });
  }

  function openDeleteModal(nodeId: string) {
    setModal({ type: "delete", targetId: nodeId });
  }

  function closeModal() {
    setModal({ type: "none" });
  }

  function getNodeById(id: string) {
    const findNode = (node: any): any => {
      if (node.id === id) return node;
      for (const child of node.children || []) {
        const found = findNode(child);
        if (found) return found;
      }
      return null;
    };
    return findNode(fs.root);
  }

  // GSAP animation for items
  useEffect(() => {
    if (contentRef.current) {
      const items = contentRef.current.querySelectorAll("[data-item]");
      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        },
      );
    }
  }, [activeFolder.children, searchQuery]);

  // Animate header on mount
  useEffect(() => {
    gsap.fromTo(
      ".file-manager-header",
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
    );
    gsap.fromTo(
      ".file-manager-breadcrumb",
      { opacity: 0 },
      { opacity: 1, duration: 0.5, delay: 0.1, ease: "power2.out" },
    );
  }, []);

  const filteredChildren = activeFolder.children.filter((child) =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Dynamic counts
  const folderCount = activeFolder.children.filter(
    (c) => c.type === "folder",
  ).length;
  const fileCount = activeFolder.children.filter(
    (c) => c.type === "textfile",
  ).length;
  const totalCount = activeFolder.children.length;
  const isSearching = searchQuery.trim().length > 0;
  const filteredFolderCount = filteredChildren.filter(
    (c) => c.type === "folder",
  ).length;
  const filteredFileCount = filteredChildren.filter(
    (c) => c.type === "textfile",
  ).length;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Top Bar */}
      <div className="file-manager-header border-b border-white/10 bg-white/80 backdrop-blur-sm px-5 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2.5 bg-white/70 backdrop-blur-sm border border-white/20 px-3.5 py-2 rounded-lg shadow-sm hover:shadow-md hover:border-white/40 transition-all duration-200">
            <Search className="h-4 w-4 text-slate-500" strokeWidth={2.5} />
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

          {/* Actions */}
          <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg p-1 shadow-sm">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  className={cn(
                    "h-7 w-7 p-0 rounded-md transition-all",
                    viewMode === "grid"
                      ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/60",
                  )}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-3.5 w-3.5" strokeWidth={2.2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-[11px]">Grid view</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  className={cn(
                    "h-7 w-7 p-0 rounded-md transition-all",
                    viewMode === "list"
                      ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/60",
                  )}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-3.5 w-3.5" strokeWidth={2.2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-[11px]">List view</TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="h-8 px-3.5 gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                onClick={() => openCreateModal(activeFolder.id)}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> New
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-[11px]">
              Create new item
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="file-manager-breadcrumb border-b border-white/10 bg-white/40 backdrop-blur-sm px-5 py-2.5">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, i) => (
              <BreadcrumbItem key={crumb.id}>
                {i > 0 && <BreadcrumbSeparator />}
                {i === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="text-slate-800 font-medium text-xs">
                    {crumb.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    asChild
                    className="cursor-pointer"
                    onClick={() => fs.navigateTo(crumb.id)}
                  >
                    <button className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
                      {crumb.name}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Content */}
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
                  : "Create a folder or file to get started"}
              </p>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredChildren.map((child) => (
              <div key={child.id} data-item className="group cursor-pointer">
                <div
                  onClick={() => fs.handleNodeClick(child)}
                  className="relative h-[140px] bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-sm hover:shadow-lg hover:border-white/40 hover:bg-white/80 transition-all duration-300 flex flex-col items-center justify-center gap-2.5"
                >
                  {/* Menu Button */}
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-md hover:bg-white/60"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal
                            className="h-4 w-4 text-slate-600"
                            strokeWidth={2.5}
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-white/90 backdrop-blur-lg border-white/20 shadow-xl"
                      >
                        {child.type === "folder" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => fs.handleNodeClick(child)}
                              className="gap-2"
                            >
                              <FolderOpen
                                className="w-3.5 h-3.5 text-amber-600"
                                strokeWidth={2.2}
                              />
                              Open folder
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openCreateModal(child.id)}
                              className="gap-2"
                            >
                              <Plus
                                className="w-3.5 h-3.5 text-amber-600"
                                strokeWidth={2.5}
                              />
                              New item inside
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-200/50" />
                          </>
                        )}

                        <DropdownMenuItem
                          onClick={() => openRenameModal(child.id)}
                          className="gap-2"
                        >
                          <Pencil
                            className="w-3.5 h-3.5 text-slate-600"
                            strokeWidth={2.5}
                          />
                          Rename
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-200/50" />

                        <DropdownMenuItem
                          onClick={() => openDeleteModal(child.id)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 gap-2"
                        >
                          <Trash2
                            className="w-3.5 h-3.5 text-red-500"
                            strokeWidth={2.5}
                          />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Icon */}
                  {child.type === "folder" ? (
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-300">
                      <Folder
                        className="h-5 w-5 text-amber-600"
                        strokeWidth={2.2}
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                      <FileText
                        className="h-5 w-5 text-blue-600"
                        strokeWidth={2.2}
                      />
                    </div>
                  )}

                  {/* Name */}
                  <p className="text-[13px] font-medium text-slate-800 text-center truncate px-2 max-w-full">
                    {child.name}
                  </p>

                  {/* Type label */}
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                    {child.type === "folder" ? "Folder" : "File"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredChildren.map((child) => (
              <div key={child.id} data-item className="group cursor-pointer">
                <div
                  onClick={() => fs.handleNodeClick(child)}
                  className="flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg shadow-sm hover:shadow-md hover:border-white/40 hover:bg-white/80 transition-all duration-200"
                >
                  {/* Icon */}
                  {child.type === "folder" ? (
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/40 flex items-center justify-center flex-shrink-0">
                      <Folder
                        className="h-4 w-4 text-amber-600"
                        strokeWidth={2.2}
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/40 flex items-center justify-center flex-shrink-0">
                      <FileText
                        className="h-4 w-4 text-blue-600"
                        strokeWidth={2.2}
                      />
                    </div>
                  )}

                  {/* Name */}
                  <span className="text-sm font-medium text-slate-800 flex-1">
                    {child.name}
                  </span>

                  {/* Type badge */}
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                    {child.type === "folder" ? "Folder" : "File"}
                  </span>

                  {/* Menu Button */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-md hover:bg-white/60"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal
                            className="h-4 w-4 text-slate-600"
                            strokeWidth={2.5}
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-white/90 backdrop-blur-lg border-white/20 shadow-xl"
                      >
                        {child.type === "folder" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => fs.handleNodeClick(child)}
                              className="gap-2"
                            >
                              <FolderOpen
                                className="w-3.5 h-3.5 text-amber-600"
                                strokeWidth={2.2}
                              />
                              Open folder
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openCreateModal(child.id)}
                              className="gap-2"
                            >
                              <Plus
                                className="w-3.5 h-3.5 text-amber-600"
                                strokeWidth={2.5}
                              />
                              New item inside
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-200/50" />
                          </>
                        )}

                        <DropdownMenuItem
                          onClick={() => openRenameModal(child.id)}
                          className="gap-2"
                        >
                          <Pencil
                            className="w-3.5 h-3.5 text-slate-600"
                            strokeWidth={2.5}
                          />
                          Rename
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-200/50" />

                        <DropdownMenuItem
                          onClick={() => openDeleteModal(child.id)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 gap-2"
                        >
                          <Trash2
                            className="w-3.5 h-3.5 text-red-500"
                            strokeWidth={2.5}
                          />
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

      {/* Status Bar */}
      <div className="border-t border-white/10 bg-white/50 backdrop-blur-sm px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-slate-600">
          <span className="font-semibold text-slate-800">
            {isSearching ? filteredChildren.length : totalCount} item
            {totalCount !== 1 ? "s" : ""}
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Folder className="w-3 h-3 text-amber-600" strokeWidth={2.5} />
            {isSearching ? filteredFolderCount : folderCount} folder
            {folderCount !== 1 ? "s" : ""}
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3 text-blue-600" strokeWidth={2.5} />
            {isSearching ? filteredFileCount : fileCount} file
            {fileCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <HardDrive className="w-3 h-3" strokeWidth={2} />
          <span>Saved to localStorage</span>
        </div>
      </div>

      {/* Create Modal */}
      {modal.type === "create" && (
        <CreateItemModal
          open={true}
          parentFolderName={
            modal.type === "create"
              ? getNodeById(modal.targetId)?.name || "Folder"
              : activeFolder.name
          }
          onOpenChange={closeModal}
          onCreate={handleCreate}
        />
      )}

      {/* Rename Modal */}
      {modal.type === "rename" && (
        <RenameModal
          open={true}
          currentName={getNodeById(modal.targetId)?.name || ""}
          nodeType={getNodeById(modal.targetId)?.type || "file"}
          onOpenChange={closeModal}
          onRename={handleRename}
        />
      )}

      {/* Delete Modal */}
      {modal.type === "delete" && (
        <DeleteModal
          open={true}
          nodeName={getNodeById(modal.targetId)?.name || ""}
          nodeType={getNodeById(modal.targetId)?.type || "file"}
          childCount={getNodeById(modal.targetId)?.children?.length || 0}
          onOpenChange={closeModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default Home;
