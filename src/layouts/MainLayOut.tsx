import { Outlet } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFileSystem } from "@/hooks/useFileSystem";
import { Sidebar } from "@/components/ui/Sidebar";

export default function MainLayout() {
  const fs = useFileSystem();

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <Sidebar
          root={fs.root}
          activeFolderId={fs.activeFolderId}
          activeFolderName={fs.activeFolder.name}
          selectedId={fs.selectedId}
          onNavigate={fs.navigateTo}
          onToggleFolder={fs.toggleFolder}
          onOpenFile={fs.openFile}
          onCreateNode={fs.createNode}
          onRename={fs.openRenameModal}
          onDelete={fs.openDeleteModal}
        />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Outlet context={fs} />
        </main>
      </div>
    </TooltipProvider>
  );
}