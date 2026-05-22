import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useOutletFileSystem } from "@/hooks/useOutletFileSystem";
import { Grid3x3, List, Plus, Search } from "lucide-react";
import { type Key, type ReactElement, type JSXElementConstructor, type ReactNode, type ReactPortal, useState } from "react";
interface FileItem {
  id: string
  name: string
  type: 'folder' | 'file'
  size?: string
  count?: number
  parent?: string
}

const initialFolders: FileItem[] = [
  { id: '1', name: 'Documents', type: 'folder', count: 5, parent: 'my-files' },
  { id: '2', name: 'Work', type: 'folder', count: 4, parent: 'documents' },
  { id: '3', name: 'Personal', type: 'folder', count: 2, parent: 'documents' },
  { id: '4', name: 'Projects', type: 'folder', parent: 'my-files' },
]

const initialFiles: FileItem[] = [
  { id: 'f1', name: 'Open', type: 'file', size: '12 KB', parent: 'documents' },
  { id: 'f2', name: 'meeting-notes.txt', type: 'file', size: '0.8 KB', parent: 'documents' },
  { id: 'f3', name: 'todo.txt', type: 'file', size: '0.3 KB', parent: 'documents' },
  { id: 'f4', name: 'readme.txt', type: 'file', parent: 'my-files' },
  { id: 'f5', name: 'notes.txt', type: 'file', parent: 'my-files' },
]
const Home = () => {
 const fs = useOutletFileSystem();
  const { activeFolder, breadcrumbs } = fs;
   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPath, setCurrentPath] = useState<string[]>(['my-files', 'documents'])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['my-files', 'documents']))
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')

  const filteredFolders = initialFolders.filter(
    item => item.parent === currentPath[currentPath.length - 1] && 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredFiles = initialFiles.filter(
    item => item.parent === currentPath[currentPath.length - 1] && 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedFolders(newExpanded)
  }

  const handleCreateItem = () => {
    console.log('Creating:', newItemName)
    setNewItemName('')
    setDialogOpen(false)
  }
  return (
    <div className="flex flex-col h-full">
      {/* breadcrumb bar */}
   <div className="border-b border-slate-800 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 flex items-center gap-2 bg-slate-900 px-3 py-2 rounded border border-slate-800">
                <Search className="h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 text-sm placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      className="h-8 w-8 p-0"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Grid view</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      className="h-8 w-8 p-0"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>List view</TooltipContent>
                </Tooltip>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button size="sm" className="h-8 px-3 gap-1 text-xs">
                          <Plus className="h-3 w-3" /> New
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Create new item</TooltipContent>
                  </Tooltip>
                </Dialog>
              </div>
            </div>
          </div>

 
      {/* content placeholder */}
      <div className="flex-1 p-6">
        <p className="text-sm text-muted-foreground mb-4">
          Viewing: <span className="text-foreground font-medium">{activeFolder.name}</span>
          {" "}· {activeFolder.children.length} items
        </p>
        <ul className="flex flex-col gap-1">
          {activeFolder.children.map((child) => (
            <li
              key={child.id}
              className="text-sm px-3 py-2 rounded-md hover:bg-accent cursor-pointer"
              onClick={() => fs.handleNodeClick(child)}
            >
              {child.type === "folder" ? "📁" : "📄"} {child.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Home;