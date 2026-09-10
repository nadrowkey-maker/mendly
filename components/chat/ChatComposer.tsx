"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowUp, X, Image as ImageIcon, FileText } from "lucide-react";
import type { FileAttachment } from "@/lib/ai/gemini";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  busy: boolean;
  isDebating: boolean;
  agentLabel: string;
  selectedFile?: FileAttachment | null;
  onFileChange?: (f: FileAttachment | null) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  busy,
  isDebating,
  agentLabel,
  selectedFile,
  onFileChange,
}: Props) {
  const t = useTranslations("chat");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxH = window.innerWidth < 768 ? 120 : 280;
    ta.style.height = `${Math.min(ta.scrollHeight, maxH)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!busy && value.trim()) onSubmit();
    }
  };

  const readFile = (file: File) => {
    setFileError(null);
    if (file.size > MAX_FILE_SIZE) {
      setFileError(t("fileTooBig"));
      return;
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      setFileError(t("fileUnsupported"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(",")[1];
      onFileChange?.({ data: base64, mimeType: file.type, name: file.name });
      setAttachOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const isPdf = selectedFile?.mimeType === "application/pdf";

  return (
    <div className="px-3 md:px-8 pb-3 md:pb-6 pt-2 bg-linear-to-t from-(--shell) via-(--shell) to-transparent">
      <div className="max-w-3xl mx-auto">
        {/* File preview chip */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 mb-2 px-3 py-2 rounded-2xl bg-(--surface) border border-(--border-strong) w-fit max-w-full"
            >
              {isPdf ? (
                <FileText className="w-4 h-4 text-(--accent-glow) shrink-0" />
              ) : (
                <ImageIcon className="w-4 h-4 text-(--accent-warm) shrink-0" aria-hidden />
              )}
              <span className="text-xs font-mono text-(--text-muted) truncate max-w-52">
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={() => onFileChange?.(null)}
                className="shrink-0 p-0.5 rounded-full hover:bg-(--surface-elevated) text-(--text-dim) hover:text-(--text-primary) transition-colors"
                aria-label={t("removeFile")}
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden file inputs */}
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readFile(file);
            e.target.value = "";
          }}
        />
        <input
          ref={imgInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readFile(file);
            e.target.value = "";
          }}
        />

        {/* Composer wrapper */}
        <div
          className={[
            "relative rounded-3xl border bg-(--panel) transition-all",
            busy
              ? "border-(--accent-glow)/40"
              : "border-(--panel-line) hover:border-(--border-emphasis) focus-within:border-(--accent-glow)/60",
          ].join(" ")}
          style={{
            boxShadow: busy
              ? "0 0 0 4px rgba(124,58,237,0.08), 0 8px 32px rgba(0,0,0,0.4)"
              : "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          {/* Attachment slide-out panel */}
          <AnimatePresence>
            {attachOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-b border-(--border)"
              >
                <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--surface-elevated) border border-(--border) text-xs text-(--text-muted) hover:text-(--text-primary) hover:border-(--accent-glow)/50 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {t("attachFile")}
                  </button>
                  <button
                    type="button"
                    onClick={() => imgInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--surface-elevated) border border-(--border) text-xs text-(--text-muted) hover:text-(--text-primary) hover:border-(--accent-glow)/50 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" aria-hidden />
                    {t("attachImage")}
                  </button>
                  {fileError && (
                    <span className="text-[10px] text-red-400 font-mono ml-auto">
                      {fileError}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main composer area */}
          <div className="flex items-end gap-2 p-3">
            <button
              type="button"
              onClick={() => {
                setAttachOpen((v) => !v);
                setFileError(null);
              }}
              disabled={busy}
              className={[
                "shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                attachOpen || selectedFile
                  ? "bg-(--accent-glow) text-(--bg-primary)"
                  : "bg-(--surface-elevated) text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface-hover)",
              ].join(" ")}
              title={t("attach")}
            >
              {attachOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("composerPlaceholder", { agent: agentLabel })}
              rows={1}
              disabled={busy}
              className="flex-1 px-2 py-2 bg-transparent text-(--text-primary) placeholder-(--text-dim) focus:outline-none resize-none disabled:opacity-50 max-h-30 md:max-h-70 text-base leading-relaxed font-medium"
            />

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onSubmit}
                disabled={busy || !value.trim()}
                className="shrink-0 w-9 h-9 rounded-full bg-(--text-primary) text-(--bg-primary) hover:bg-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {busy && !isDebating ? (
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-current animate-bounce" />
                    <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0.3s]" />
                  </span>
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-(--text-dim) text-center mt-3 font-mono">
          {t("shortcut")}
        </p>
      </div>
    </div>
  );
}
