import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileText,
  Save,
  X,
  RotateCcw,
  CheckCircle2,
  AlignLeft,
  Hash,
  Type,
} from "lucide-react";
import type { TextFileNode } from "@/types";

interface TextEditorProps {
  file: TextFileNode;
  onSave: (id: string, content: string) => void;
  onClose: () => void;
}

export function TextEditor({ file, onSave, onClose }: TextEditorProps) {
  const [content, setContent] = useState(file.content);
  const [savedContent, setSavedContent] = useState(file.content);
  const [justSaved, setJustSaved] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedBadgeRef = useRef<HTMLSpanElement>(null);

  const isDirty = content !== savedContent;

  useEffect(() => {
    setContent(file.content);
    setSavedContent(file.content);
    setJustSaved(false);
  }, [file.id]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    gsap.fromTo(
      wrapperRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
    );
    setTimeout(() => textareaRef.current?.focus(), 180);
  }, [file.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    },
    [content],
  );

  function save() {
    onSave(file.id, content);
    setSavedContent(content);
    setJustSaved(true);
    if (savedBadgeRef.current) {
      gsap.fromTo(
        savedBadgeRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.22, ease: "back.out(2)" },
      );
    }
    setTimeout(() => setJustSaved(false), 2200);
  }

  function discard() {
    setContent(savedContent);
  }

  const lines = content.split("\n").length;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col flex-1 h-full min-h-0 bg-white"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg">
          <FileText
            className="w-3.5 h-3.5 text-blue-500 flex-shrink-0"
            strokeWidth={2.2}
          />
          <span className="text-xs font-semibold text-slate-700 max-w-[180px] truncate">
            {file.name}
          </span>
          {isDirty && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"
              title="Unsaved changes"
            />
          )}
        </div>

        <div className="flex-1" />
        {justSaved && (
          <span
            ref={savedBadgeRef}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"
          >
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
            Saved
          </span>
        )}

        {isDirty && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 gap-1.5"
            onClick={discard}
          >
            <RotateCcw className="w-3 h-3" strokeWidth={2.5} />
            Discard
          </Button>
        )}

        <Button
          size="sm"
          className={cn(
            "h-8 px-3.5 text-xs font-semibold gap-1.5 transition-all shadow-sm",
            isDirty
              ? "bg-slate-900 hover:bg-slate-700 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed",
          )}
          onClick={save}
          disabled={!isDirty}
        >
          <Save className="w-3 h-3" strokeWidth={2.5} />
          Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          onClick={onClose}
          title="Close (go back to folder)"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
        </Button>
      </div>

      <div className="flex-1 min-h-0 relative">
        {content === "" && (
          <p className="absolute top-6 left-6 text-sm text-slate-300 pointer-events-none select-none font-mono">
            Start typing…
          </p>
        )}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className={cn(
            "w-full h-full resize-none outline-none",
            "bg-white text-slate-800",
            "font-mono text-sm leading-7",
            "px-6 py-5",
            "border-0",
            // browser scrollbar
            "overflow-y-auto",
          )}
        />
      </div>

      <div className="flex items-center gap-4 px-5 py-2 border-t border-slate-100 bg-slate-50/80 flex-shrink-0">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <AlignLeft className="w-3 h-3" strokeWidth={2} />
          {lines} line{lines !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Type className="w-3 h-3" strokeWidth={2} />
          {words} word{words !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Hash className="w-3 h-3" strokeWidth={2} />
          {chars} char{chars !== 1 ? "s" : ""}
        </span>
        <span className="ml-auto text-[11px]">
          {isDirty ? (
            <span className="text-amber-500 font-medium">
              Unsaved changes · Ctrl+S to save
            </span>
          ) : (
            <span className="text-slate-400">Plain text · UTF-8</span>
          )}
        </span>
      </div>
    </div>
  );
}
