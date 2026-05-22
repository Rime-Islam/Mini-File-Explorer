import { Sidebar } from "@/components/ui/Sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFileSystem } from "@/hooks/useFileSystem";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const fs = useFileSystem();
 return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <Sidebar
          root={fs.root}
          activeFolderId={fs.activeFolderId}
          selectedId={fs.selectedId}
          onNavigate={fs.navigateTo}
          onToggleFolder={fs.toggleFolder}
          onOpenFile={fs.openFile}
          onCreateIn={fs.openCreateModal}
          onRename={fs.openRenameModal}
          onDelete={fs.openDeleteModal}
        />
 
        {/* main content area — receives the fs hook via outlet context */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Outlet context={fs} />
        </main>
      </div>
    </TooltipProvider>
  );
}