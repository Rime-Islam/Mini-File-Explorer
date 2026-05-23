import { useOutletContext } from "react-router-dom";
import { useFileSystem } from "@/hooks/useFileSystem";

export function useOutletFileSystem(): ReturnType<typeof useFileSystem> {
  return useOutletContext<ReturnType<typeof useFileSystem>>();
}