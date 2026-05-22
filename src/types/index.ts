export type NodeType = "folder" | "textfile";

export interface BaseNode {
  id: string;
  name: string;
  type: NodeType;
  createdAt: number;
  updatedAt: number;
}

export interface TextFileNode extends BaseNode {
  type: "textfile";
  content: string;
  size: number;
}

export interface FolderNode extends BaseNode {
  type: "folder";
  children: FileSystemNode[];
  isExpanded: boolean;
}

export type FileSystemNode = FolderNode | TextFileNode;

export interface PersistedFileSystem {
  version: number;
  root: FolderNode;
  updatedAt: number;
}

export type ViewMode = "grid" | "list";

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export type ModalType = "create" | "rename" | "delete" | null;

export interface CreateModalState {
  type: "create";
  parentId: string;
}

export interface RenameModalState {
  type: "rename";
  nodeId: string;
  currentName: string;
}

export interface DeleteModalState {
  type: "delete";
  nodeId: string;
  nodeName: string;
  nodeType: NodeType;
  childCount: number;
}

export type ActiveModal =
  | CreateModalState
  | RenameModalState
  | DeleteModalState
  | null;