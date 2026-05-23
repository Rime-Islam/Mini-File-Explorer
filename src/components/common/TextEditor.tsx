import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileText,
  X,
  Save,
  RotateCcw,
} from "lucide-react";
import type { TextFileNode } from "@/types";
import { formatSize } from "@/utils/Treehelpers";

interface TextEditorProps {
  file: TextFileNode;
  onSave: (id: string, content: string) => void;
  onClose: () => void;
}

export function TextEditor({ file, onSave, onClose }: TextEditorProps) {
  const [content, setContent] = useState(file.content);
  const [isSaved, setIsSaved] = useState(true);

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setContent(file.content);
    setIsSaved(true);
  }, [file.id, file.content]);

  // GSAP: slide up on mount
  useEffect(() => {
    if (overlayRef.current && panelRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" });
      gsap.fromTo(panelRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" });
    }
  }, []);

  // Ctrl+S / Cmd+S to save
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        handleClose();
      }
    },
    [content]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleChange(val: string) {
    setContent(val);
    setIsSaved(false);
  }

  function handleSave() {
    onSave(file.id, content);
    setIsSaved(true);
    // Show saved state briefly
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setIsSaved(true), 2000);
  }

  function handleDiscard() {
    setContent(file.content);
    setIsSaved(true);
  }

  function handleClose() {
    if (!isSaved) {
      // Shake panel to signal unsaved changes
      if (panelRef.current) {
        gsap.fromTo(
          panelRef.current,
          { x: -6 },
          { x: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" }
        );
      }
      return;
    }
    animateClose(onClose);
  }

  function handleForceClose() {
    animateClose(onClose);
  }

  function animateClose(cb: () => void) {
    if (overlayRef.current && panelRef.current) {
      gsap.to(panelRef.current, { y: 16, opacity: 0, duration: 0.18, ease: "power2.in" });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, ease: "power2.in", onComplete: cb });
    } else {
      cb();
    }
  }

  const lineCount = content.split("\n").length;
  const charCount = content.length;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
    >
      <div
        ref={panelRef}
        className="w-full max-w-3xl h-full max-h-[80vh] flex flex-col rounded-xl border border-slate-700 bg-slate-950 shadow-2xl shadow-black/80 overflow-hidden"
      >
        {/* ── title bar ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-500/15 flex-shrink-0">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-slate-100 truncate">
              {file.name}
            </span>
            {!isSaved && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Unsaved changes" />
            )}
          </div>

          {/* actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!isSaved && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800 gap-1.5"
                onClick={handleDiscard}
              >
                <RotateCcw className="w-3 h-3" />
                Discard
              </Button>
            )}
            <Button
              size="sm"
              className={cn(
                "h-7 px-3 text-xs font-medium gap-1.5 transition-all",
                isSaved
                  ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              )}
              onClick={handleSave}
            >
              <Save className="w-3 h-3" />
              {isSaved ? "Saved" : "Save"}
            </Button>
            <div className="w-px h-4 bg-slate-700 mx-0.5" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-500 hover:text-slate-200 hover:bg-slate-800"
              onClick={handleClose}
              title={isSaved ? "Close" : "Close (unsaved changes — save first)"}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* ── unsaved warning banner ────────────────────────────── */}
        {!isSaved && (
          <div className="flex items-center justify-between px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20">
            <p className="text-[11px] text-amber-400">
              You have unsaved changes.{" "}
              <kbd className="font-mono text-amber-300">Ctrl+S</kbd> to save.
            </p>
            <button
              className="text-[11px] text-amber-400 hover:text-amber-200 underline underline-offset-2"
              onClick={handleForceClose}
            >
              Close anyway
            </button>
          </div>
        )}

        {/* ── editor ───────────────────────────────────────────── */}
        <textarea
          className={cn(
            "flex-1 w-full resize-none bg-slate-950 text-slate-100",
            "font-mono text-sm leading-7 px-6 py-4",
            "focus:outline-none placeholder:text-slate-600",
            "scrollbar-thin scrollbar-thumb-slate-700"
          )}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Start typing…"
          spellCheck={false}
          autoFocus
        />

        <div className="flex items-center gap-4 px-4 py-1.5 border-t border-slate-800 bg-slate-900/60 text-[11px] text-slate-500">
          <span>{lineCount} line{lineCount !== 1 ? "s" : ""}</span>
          <span>{charCount} char{charCount !== 1 ? "s" : ""}</span>
          <span>{formatSize(new Blob([content]).size)}</span>
          <span className="ml-auto">Plain text · UTF-8</span>
        </div>
      </div>
    </div>
  );
}