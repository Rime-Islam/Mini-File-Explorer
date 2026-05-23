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
import { Folder, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeType } from "@/types";
import { Label } from "../ui/label";

interface CreateItemModalProps {
  open: boolean;
  parentFolderName: string;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, type: NodeType) => void;
}

const TYPE_OPTIONS: {
  type: NodeType;
  label: string;
  description: string;
  icon: typeof Folder;
  ext: string;
}[] = [
  {
    type: "folder",
    label: "Folder",
    description: "Organise files into a folder",
    icon: Folder,
    ext: "",
  },
  {
    type: "textfile",
    label: "Text file",
    description: "A plain text file you can edit",
    icon: FileText,
    ext: ".txt",
  },
];

export function CreateItemModal({
  open,
  parentFolderName,
  onOpenChange,
  onCreate,
}: CreateItemModalProps) {
  const [selectedType, setSelectedType] = useState<NodeType>("folder");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // refs for GSAP
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const formRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelectedType("folder");
      setName("");
      setError("");
      // Animate type cards in with stagger
      setTimeout(() => {
        gsap.fromTo(
          cardRefs.current.filter(Boolean),
          { y: 10, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.28,
            stagger: 0.07,
            ease: "power2.out",
          }
        );
        if (formRef.current) {
          gsap.fromTo(
            formRef.current,
            { y: 6, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, delay: 0.15, ease: "power2.out" }
          );
        }
        // Auto-focus input after animation
        setTimeout(() => inputRef.current?.focus(), 200);
      }, 0);
    }
  }, [open]);

  // Animate card switch
  function handleTypeSelect(type: NodeType) {
    if (type === selectedType) return;
    setSelectedType(type);
    setError("");
    // Bounce the selected card
    const idx = TYPE_OPTIONS.findIndex((o) => o.type === type);
    const el = cardRefs.current[idx];
    if (el) {
      gsap.fromTo(
        el,
        { scale: 0.96 },
        { scale: 1, duration: 0.25, ease: "back.out(2)" }
      );
    }
  }

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a name.");
      // Shake the input
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { x: -6 },
          { x: 0, duration: 0.35, ease: "elastic.out(1, 0.4)" }
        );
      }
      return;
    }

    // Auto-append .txt for text files if missing
    const finalName =
      selectedType === "textfile" && !trimmed.endsWith(".txt")
        ? `${trimmed}.txt`
        : trimmed;

    onCreate(finalName, selectedType);
    onOpenChange(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") onOpenChange(false);
  }

  const selectedOption = TYPE_OPTIONS.find((o) => o.type === selectedType)!;
  const placeholder =
    selectedType === "folder" ? "New folder" : "filename.txt";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[380px] p-0 gap-0 overflow-hidden",
          "border border-white/10 bg-white/80 backdrop-blur-lg text-slate-900",
          "shadow-2xl shadow-black/20"
        )}
      >
        {/* ── header ─────────────────────────────────────────── */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-white/10">
          <DialogTitle className="text-sm font-semibold text-slate-900 tracking-tight">
            Create new item
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 mt-0.5">
            Inside{" "}
            <span className="text-slate-800 font-medium">
              {parentFolderName}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* ── body ───────────────────────────────────────────── */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* type selector */}
          <div className="grid grid-cols-2 gap-2.5">
            {TYPE_OPTIONS.map(({ type, label, description, icon: Icon }, i) => {
              const active = selectedType === type;
              return (
                <button
                  key={type}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  onClick={() => handleTypeSelect(type)}
                  className={cn(
                    "relative flex flex-col items-start gap-2.5 rounded-lg border p-3.5 text-left transition-all duration-150 cursor-pointer",
                    "focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500",
                    active
                      ? type === "folder"
                        ? "border-amber-500 bg-amber-400/15"
                        : "border-blue-500 bg-blue-400/15"
                      : "border-white/20 bg-white/30 hover:border-white/30 hover:bg-white/40"
                  )}
                >
                  {/* check badge */}
                  {active && (
                    <span
                      className={cn(
                        "absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center",
                        type === "folder" ? "bg-amber-500" : "bg-blue-500"
                      )}
                    >
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}

                  {/* icon */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-md flex items-center justify-center",
                      active
                        ? type === "folder"
                          ? "bg-amber-400/25"
                          : "bg-blue-400/25"
                        : "bg-white/40"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        active
                          ? type === "folder"
                            ? "text-amber-600"
                            : "text-blue-600"
                          : "text-slate-600"
                      )}
                    />
                  </div>

                  {/* text */}
                  <div>
                    <p
                      className={cn(
                        "text-xs font-semibold leading-none mb-1",
                        active ? "text-slate-900" : "text-slate-700"
                      )}
                    >
                      {label}
                    </p>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      {description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* name input */}
          <div ref={formRef} className="flex flex-col gap-1.5">
            <Label
              htmlFor="item-name"
              className="text-[11px] font-medium text-slate-700 uppercase tracking-wider"
            >
              Name
            </Label>
            <div className="relative">
              <selectedOption.icon
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none",
                  selectedType === "folder"
                    ? "text-amber-600"
                    : "text-blue-600"
                )}
              />
              <Input
                id="item-name"
                ref={inputRef}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn(
                  "pl-8 text-sm h-9",
                  "bg-white/50 backdrop-blur-sm border-white/20 text-slate-900 placeholder:text-slate-500",
                  "focus-visible:ring-1",
                  selectedType === "folder"
                    ? "focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
                    : "focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50",
                  error && "border-red-500/60"
                )}
              />
            </div>

            {/* error */}
            {error && (
              <p className="text-[11px] text-red-600">{error}</p>
            )}

            {/* hint: auto .txt */}
            {selectedType === "textfile" &&
              name.trim() &&
              !name.trim().endsWith(".txt") && (
                <p className="text-[10px] text-slate-600">
                  Will be saved as{" "}
                  <span className="text-slate-800">{name.trim()}.txt</span>
                </p>
              )}
          </div>
        </div>

        {/* ── footer ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/10 bg-white/20">
          <p className="text-[10px] text-slate-700">
            Press <kbd className="font-mono text-slate-600">Enter</kbd> to
            create
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
                "h-8 px-4 text-xs font-semibold transition-all",
                selectedType === "folder"
                  ? "bg-amber-500 hover:bg-amber-400 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              )}
              onClick={handleSubmit}
            >
              Create{" "}
              {selectedType === "folder" ? "folder" : "file"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
