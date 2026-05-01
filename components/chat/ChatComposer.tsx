"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Zap, ArrowUp, Paperclip, X, Image, FileText } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onDebate?: () => void;
  busy: boolean;
  isDebating: boolean;
  canDebate: boolean; // true only for CEO
  agentLabel: string;
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onDebate,
  busy,
  isDebating,
  canDebate,
  agentLabel,
}: Props) {
  const t = useTranslations("chat");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [attachOpen, setAttachOpen] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 280)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!busy && value.trim()) onSubmit();
    }
  };

  return (
    <div className="px-4 md:px-8 pb-6 pt-2 bg-gradient-to-t from-(--bg-primary) via-(--bg-primary) to-transparent">
      <div className="max-w-3xl mx-auto">
        {/* Composer wrapper */}
        <div
          className={[
            "relative rounded-3xl border bg-(--surface) transition-all",
            busy
              ? "border-(--accent-glow)/40"
              : "border-(--border-strong) hover:border-(--border-emphasis) focus-within:border-(--accent-glow)/60",
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
                <div className="px-4 py-3 flex items-center gap-2">
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--surface-elevated) border border-(--border) text-xs text-(--text-muted) opacity-50 cursor-not-allowed"
                    title={t("comingSoon")}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {t("attachFile")}
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--surface-elevated) border border-(--border) text-xs text-(--text-muted) opacity-50 cursor-not-allowed"
                    title={t("comingSoon")}
                  >
                    <Image className="w-3.5 h-3.5" aria-hidden />
                    {t("attachImage")}
                  </button>
                  <span className="text-[10px] font-mono text-(--text-dim) uppercase tracking-wider ml-auto">
                    {t("comingSoon")}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main composer area */}
          <div className="flex items-end gap-2 p-3">
            {/* Attach button */}
            <button
              type="button"
              onClick={() => setAttachOpen((v) => !v)}
              disabled={busy}
              className={[
                "shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                attachOpen
                  ? "bg-(--accent-glow) text-(--bg-primary)"
                  : "bg-(--surface-elevated) text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface-hover)",
              ].join(" ")}
              title={t("attach")}
            >
              {attachOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("composerPlaceholder", { agent: agentLabel })}
              rows={1}
              disabled={busy}
              className="flex-1 px-2 py-2 bg-transparent text-(--text-primary) placeholder-(--text-dim) focus:outline-none resize-none disabled:opacity-50 max-h-[280px] text-base leading-relaxed font-medium"
            />

            {/* Action buttons cluster */}
            <div className="flex items-center gap-1.5 shrink-0">
              {canDebate && (
                <button
                  type="button"
                  onClick={onDebate}
                  disabled={busy || !value.trim()}
                  title={t("debateTooltip")}
                  className={[
                    "h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer",
                    isDebating
                      ? "bg-(--accent-glow) text-(--bg-primary)"
                      : "border border-(--border-strong) text-(--text-muted) hover:text-(--text-primary) hover:border-(--accent-glow)/50",
                  ].join(" ")}
                >
                  <Zap className={["w-3.5 h-3.5", isDebating ? "animate-pulse" : ""].join(" ")} />
                  <span className="hidden md:inline">
                    {isDebating ? t("debating") : t("debate")}
                  </span>
                </button>
              )}

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

        {/* Hint */}
        <p className="text-[10px] text-(--text-dim) text-center mt-3 font-mono">
          {canDebate ? t("shortcutWithDebate") : t("shortcut")}
        </p>
      </div>
    </div>
  );
}