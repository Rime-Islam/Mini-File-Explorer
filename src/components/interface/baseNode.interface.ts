export interface BaseNode {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;

  createdAt: number;
  updatedAt: number;
}