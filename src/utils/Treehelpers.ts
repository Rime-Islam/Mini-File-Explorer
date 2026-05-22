import type { FileSystemNode, FolderNode, NodeType,TextFileNode } from "@/types";
import { generateId } from "./storage";

export function isFolder(node: FileSystemNode): node is FolderNode {
  return node.type === "folder";
}

export function isTextFile(node: FileSystemNode): node is TextFileNode {
  return node.type === "textfile";
}

export function findNodeById(
  root: FolderNode,
  id: string
): FileSystemNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    if (child.id === id) return child;
    if (isFolder(child)) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function findParentFolder(
  root: FolderNode,
  id: string
): FolderNode | null {
  for (const child of root.children) {
    if (child.id === id) return root;
    if (isFolder(child)) {
      const found = findParentFolder(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function getBreadcrumbs(
  root: FolderNode,
  targetId: string
): Array<{ id: string; name: string }> {
  function search(
    node: FolderNode,
    path: Array<{ id: string; name: string }>
  ): Array<{ id: string; name: string }> | null {
    const current = [...path, { id: node.id, name: node.name }];
    if (node.id === targetId) return current;
    for (const child of node.children) {
      if (isFolder(child)) {
        const result = search(child, current);
        if (result) return result;
      }
    }
    return null;
  }
  return search(root, []) ?? [{ id: root.id, name: root.name }];
}

export function countChildren(folder: FolderNode): number {
  let count = folder.children.length;
  for (const child of folder.children) {
    if (isFolder(child)) count += countChildren(child);
  }
  return count;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── immutable tree mutations ─────────────────────────────────────────────────

export function treeInsertNode(
  root: FolderNode,
  parentId: string,
  name: string,
  type: NodeType
): FolderNode {
  const now = Date.now();
  const newNode: FileSystemNode =
    type === "folder"
      ? {
          id: generateId(),
          name,
          type: "folder",
          children: [],
          isExpanded: false,
          createdAt: now,
          updatedAt: now,
        }
      : {
          id: generateId(),
          name,
          type: "textfile",
          content: "",
          size: 0,
          createdAt: now,
          updatedAt: now,
        };

  function insert(node: FolderNode): FolderNode {
    if (node.id === parentId) {
      return {
        ...node,
        isExpanded: true,
        children: [...node.children, newNode],
        updatedAt: now,
      };
    }
    return {
      ...node,
      children: node.children.map((child) =>
        isFolder(child) ? insert(child) : child
      ),
    };
  }
  return insert(root);
}

export function treeRenameNode(
  root: FolderNode,
  id: string,
  newName: string
): FolderNode {
  const now = Date.now();
  function rename(node: FolderNode): FolderNode {
    return {
      ...node,
      children: node.children.map((child) => {
        if (child.id === id) return { ...child, name: newName, updatedAt: now };
        if (isFolder(child)) return rename(child);
        return child;
      }),
    };
  }
  return rename(root);
}

export function treeDeleteNode(root: FolderNode, id: string): FolderNode {
  function del(node: FolderNode): FolderNode {
    return {
      ...node,
      children: node.children
        .filter((child) => child.id !== id)
        .map((child) => (isFolder(child) ? del(child) : child)),
    };
  }
  return del(root);
}

export function treeUpdateContent(
  root: FolderNode,
  id: string,
  content: string
): FolderNode {
  const now = Date.now();
  function update(node: FolderNode): FolderNode {
    return {
      ...node,
      children: node.children.map((child) => {
        if (child.id === id && isTextFile(child)) {
          return {
            ...child,
            content,
            size: new Blob([content]).size,
            updatedAt: now,
          };
        }
        if (isFolder(child)) return update(child);
        return child;
      }),
    };
  }
  return update(root);
}

export function treeToggleExpanded(
  root: FolderNode,
  id: string
): FolderNode {
  function toggle(node: FolderNode): FolderNode {
    if (node.id === id) return { ...node, isExpanded: !node.isExpanded };
    return {
      ...node,
      children: node.children.map((child) =>
        isFolder(child) ? toggle(child) : child
      ),
    };
  }
  return toggle(root);
}