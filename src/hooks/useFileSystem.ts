import { useState, useCallback, useEffect } from "react";
import type {
  FolderNode,
  FileSystemNode, 
  ViewMode,
  ActiveModal,
  NodeType,
} from "@/types";
import { loadFromStorage, saveToStorage } from "@/utils/storage";
import {
  treeInsertNode,
  treeRenameNode,
  treeDeleteNode,
  treeUpdateContent,
  treeToggleExpanded,
  getBreadcrumbs,
  findNodeById,
  isFolder,
} from "@/utils/treeHelpers";

export function useFileSystem() {
  const [root, setRoot] = useState<FolderNode>(() => loadFromStorage());
  const [activeFolderId, setActiveFolderId] = useState<string>(() => loadFromStorage().id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openFileId, setOpenFileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  // Persist on every root change
  useEffect(() => {
    saveToStorage(root);
  }, [root]);

  // ─── derived state ─────────────────────────────────────────────────────────

  const activeFolder = (findNodeById(root, activeFolderId) as FolderNode | null) ?? root;
  const breadcrumbs = getBreadcrumbs(root, activeFolderId);
  const openFile = openFileId ? findNodeById(root, openFileId) : null;

  // ─── navigation ────────────────────────────────────────────────────────────

  const navigateTo = useCallback((folderId: string) => {
    setActiveFolderId(folderId);
    setSelectedId(null);
  }, []);

  const toggleFolder = useCallback((id: string) => {
    setRoot((prev) => treeToggleExpanded(prev, id));
  }, []);

  // ─── selection & opening ───────────────────────────────────────────────────

  const selectNode = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const openFile_ = useCallback(
    (id: string | null) => {
      setOpenFileId(id);
      if (id) setSelectedId(id);
    },
    []
  );

  const handleNodeClick = useCallback(
    (node: FileSystemNode) => {
      if (isFolder(node)) {
        navigateTo(node.id);
        toggleFolder(node.id);
      } else {
        openFile_(node.id);
      }
    },
    [navigateTo, toggleFolder, openFile_]
  );

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  const createNode = useCallback(
    (parentId: string, name: string, type: NodeType) => {
      setRoot((prev) => treeInsertNode(prev, parentId, name.trim(), type));
    },
    []
  );

  const renameNode = useCallback((id: string, newName: string) => {
    if (!newName.trim()) return;
    setRoot((prev) => treeRenameNode(prev, id, newName.trim()));
  }, []);

  const deleteNode = useCallback(
    (id: string) => {
      setRoot((prev) => treeDeleteNode(prev, id));
      if (selectedId === id) setSelectedId(null);
      if (openFileId === id) setOpenFileId(null);
      // If deleted folder was active, go up to root
      if (activeFolderId === id) setActiveFolderId(root.id);
    },
    [selectedId, openFileId, activeFolderId, root.id]
  );

  const updateFileContent = useCallback((id: string, content: string) => {
    setRoot((prev) => treeUpdateContent(prev, id, content));
  }, []);

  // ─── modal helpers ─────────────────────────────────────────────────────────

  const openCreateModal = useCallback((parentId: string) => {
    setActiveModal({ type: "create", parentId });
  }, []);

  const openRenameModal = useCallback((nodeId: string, currentName: string) => {
    setActiveModal({ type: "rename", nodeId, currentName });
  }, []);

  const openDeleteModal = useCallback(
    (nodeId: string) => {
      const node = findNodeById(root, nodeId);
      if (!node) return;
      setActiveModal({
        type: "delete",
        nodeId,
        nodeName: node.name,
        nodeType: node.type,
        childCount: isFolder(node) ? node.children.length : 0,
      });
    },
    [root]
  );

  const closeModal = useCallback(() => setActiveModal(null), []);

  return {
    // state
    root,
    activeFolder,
    activeFolderId,
    breadcrumbs,
    selectedId,
    viewMode,
    activeModal,

    // actions
    navigateTo,
    toggleFolder,
    selectNode,
    openFile: openFile_,
    handleNodeClick,
    createNode,
    renameNode,
    deleteNode,
    updateFileContent,
    setViewMode,

    // modal helpers
    openCreateModal,
    openRenameModal,
    openDeleteModal,
    closeModal,
  };
}