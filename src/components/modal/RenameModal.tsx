import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, FileText, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeType } from "@/types";

interface RenameModalProps {
  open: boolean;
  currentName: string;
  nodeType: NodeType;
  onOpenChange: (open: boolean) => void;
  onRename: (newName: string) => void;
}

export function RenameModal({
  open,
  currentName,
  nodeType,
  onOpenChange,
  onRename,
}: RenameModalProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState("");

  const formRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync name when modal opens with a different node
  useEffect(() => {
    if (open) {
      setName(currentName);
      setError("");
      // Animate in
      setTimeout(() => {
        if (formRef.current) {
          gsap.fromTo(
            formRef.current,
            { y: 8, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }
          );
        }
        // Select all text so user can type immediately
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0);
    }
  }, [open, currentName]);

  function handleSubmit() {
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Name cannot be empty.");
      shakeForm();
      return;
    }

    if (trimmed === currentName) {
      // No change — just close
      onOpenChange(false);
      return;
    }

    // Auto-append .txt for text files if user removed it
    const finalName =
      nodeType === "textfile" && !trimmed.endsWith(".txt")
        ? `${trimmed}.txt`
        : trimmed;

    onRename(finalName);
    onOpenChange(false);
  }

  function shakeForm() {
    if (!formRef.current) return;
    gsap.fromTo(
      formRef.current,
      { x: -6 },
      { x: 0, duration: 0.35, ease: "elastic.out(1, 0.4)" }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") onOpenChange(false);
  }

  const isFolder = nodeType === "folder";
  const Icon = isFolder ? Folder : FileText;
  const accentColor = isFolder ? "text-amber-800" : "text-blue-800";
  const focusRing = isFolder
    ? "focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
    : "focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[360px] p-0 gap-0 overflow-hidden",
          "border border-white/10 bg-white/80 backdrop-blur-lg text-slate-900",
          "shadow-2xl shadow-black/20"
        )}
      >
        {/* header */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0",
                isFolder ? "bg-amber-400/25" : "bg-blue-400/25"
              )}
            >
              <Pencil className={cn("w-[18px] h-[18px]", accentColor)} strokeWidth={2.5} />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-slate-900 tracking-tight">
                Rename {isFolder ? "folder" : "file"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 mt-0.5">
                Currently:{" "}
                <span className="text-slate-800 font-medium font-mono">
                  {currentName}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* body */}
        <div className="px-5 py-4">
          <div ref={formRef} className="flex flex-col gap-1.5">
            <Label
              htmlFor="rename-input"
              className="text-[11px] font-medium text-slate-700 uppercase tracking-wider"
            >
              New name
            </Label>
            <div className="relative">
              <Icon
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
                  accentColor
                )}
                strokeWidth={2.5}
              />
              <Input
                id="rename-input"
                ref={inputRef}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                className={cn(
                  "pl-8 text-sm h-9",
                  "bg-white/50 backdrop-blur-sm border-white/20 text-slate-900 placeholder:text-slate-500",
                  "focus-visible:ring-1",
                  focusRing,
                  error && "border-red-500/60"
                )}
              />
            </div>

            {error && (
              <p className="text-[11px] text-red-600">{error}</p>
            )}

            {/* hint: auto .txt */}
            {nodeType === "textfile" &&
              name.trim() &&
              !name.trim().endsWith(".txt") && (
                <p className="text-[10px] text-slate-600">
                  Will be saved as{" "}
                  <span className="text-slate-800">{name.trim()}.txt</span>
                </p>
              )}
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/10 bg-white/20">
          <p className="text-[10px] text-slate-700">
            Press <kbd className="font-mono text-slate-600">Enter</kbd> to save
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
              size="sm"
              className={cn(
                "h-8 px-4 text-xs font-semibold",
                isFolder
                  ? "bg-amber-500 hover:bg-amber-400 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              )}
              onClick={handleSubmit}
            >
              Rename
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}