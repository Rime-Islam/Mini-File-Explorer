import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder, FileText, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeType } from "@/types";

interface DeleteModalProps {
  open: boolean;
  nodeName: string;
  nodeType: NodeType;
  childCount: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteModal({
  open,
  nodeName,
  nodeType,
  childCount,
  onOpenChange,
  onConfirm,
}: DeleteModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const isFolder = nodeType === "folder";

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }
        );
      }
      if (btnRef.current) {
        gsap.fromTo(
          btnRef.current,
          { scale: 1 },
          {
            scale: 1.04,
            duration: 0.18,
            delay: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
          }
        );
      }
    }, 0);
  }, [open]);

  function handleConfirm() {
    onConfirm();
    onOpenChange(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onOpenChange(false);
  }

  const Icon = isFolder ? Folder : FileText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[360px] p-0 gap-0 overflow-hidden",
          "border border-white/10 bg-white/80 backdrop-blur-lg text-slate-900",
          "shadow-2xl shadow-black/20"
        )}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 bg-red-400/20">
              <TriangleAlert className="w-[18px] h-[18px] text-red-600" strokeWidth={2.5} />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-slate-900 tracking-tight">
                Delete {isFolder ? "folder" : "file"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 mt-0.5">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div ref={contentRef} className="px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20">
            <Icon
              className={cn(
                "w-4 h-4 flex-shrink-0",
                isFolder ? "text-amber-800" : "text-blue-800"
              )}
              strokeWidth={2.5}
            />
            <span className="text-sm font-medium text-slate-900 truncate">
              {nodeName}
            </span>
            {isFolder && (
              <span className="ml-auto text-[10px] text-slate-600 flex-shrink-0">
                {childCount} item{childCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isFolder && childCount > 0 ? (
              <>
                <span className="text-red-600 font-medium">
                  {childCount} item{childCount !== 1 ? "s" : ""}
                </span>{" "}
                inside this folder will also be permanently deleted.
              </>
            ) : isFolder ? (
              <>
                The empty folder{" "}
                <span className="text-slate-900 font-medium">{nodeName}</span>{" "}
                will be permanently deleted.
              </>
            ) : (
              <>
                The file{" "}
                <span className="text-slate-900 font-medium">{nodeName}</span>{" "}
                and all its content will be permanently deleted.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/10 bg-white/20">
          <p className="text-[10px] text-slate-700">
            Press <kbd className="font-mono text-slate-600">Enter</kbd> to confirm
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-slate-700 hover:text-slate-900 hover:bg-white/30"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              ref={btnRef}
              size="sm"
              className="h-8 px-4 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-500/30"
              onClick={handleConfirm}
            >
              Delete {isFolder ? "folder" : "file"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}