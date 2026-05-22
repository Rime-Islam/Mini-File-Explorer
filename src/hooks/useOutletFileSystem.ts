import { useOutletContext } from "react-router-dom";
import { useFileSystem } from "@/hooks/useFileSystem";

/**
 * Use this in any route component rendered inside MainLayout.
 *
 * Example:
 *   const fs = useOutletFileSystem();
 *   fs.activeFolder.children.map(...)
 */
export function useOutletFileSystem(): ReturnType<typeof useFileSystem> {
  return useOutletContext<ReturnType<typeof useFileSystem>>();
}