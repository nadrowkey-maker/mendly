"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Loader2, X } from "lucide-react";

interface GenerateMemoButtonProps {
  projectId: string;
}

interface GeneratedDeliverable {
  title: string;
  downloadUrl: string;
}

export function GenerateMemoButton({ projectId }: GenerateMemoButtonProps) {
  const t = useTranslations("memoButton");
  const locale = useLocale();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedDeliverable | null>(null);

  const handleGenerate = async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/deliverables/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("errorGeneric"));
      }

      setResult({
        title: data.deliverable.title,
        downloadUrl: data.downloadUrl,
      });
      setStatus("success");
    } catch (err) {
      console.error("Generate error:", err);
      setError(err instanceof Error ? err.message : t("errorGeneric"));
      setStatus("error");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
  };

  return (
    <>
      <button
        onClick={handleGenerate}
        disabled={status === "loading"}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-(--border-strong) bg-(--surface)/40 hover:bg-(--surface)/60 hover:border-(--accent-glow)/50 transition-all text-xs font-mono uppercase tracking-wider text-(--text-muted) hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileText className="w-3.5 h-3.5" />
        {t("generateMemo")}
      </button>

      <AnimatePresence>
        {(status === "loading" || status === "success" || status === "error") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/70 backdrop-blur-sm"
            onClick={status !== "loading" ? handleClose : undefined}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl border border-(--border-strong) bg-(--bg-primary)/95 backdrop-blur-xl p-8 text-center"
            >
              {status !== "loading" && (
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-full text-(--text-dim) hover:text-white hover:bg-(--surface)/40 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {status === "loading" && (
                <>
                  <div className="flex justify-center mb-6">
                    <Loader2 className="w-12 h-12 text-(--accent-glow) animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {t("loadingTitle")}
                  </h3>
                  <p className="text-(--text-muted) text-sm">
                    {t("loadingBody")}
                  </p>
                </>
              )}

              {status === "success" && result && (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-(--accent-glow)/10 border border-(--accent-glow)/30 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-(--accent-glow)" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {t("successTitle")}
                  </h3>
                  <p className="text-(--text-muted) text-sm mb-6">
                    {result.title}
                  </p>
                  <button
  onClick={() => window.open(result.downloadUrl, "_blank")}
  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-(--accent-glow) text-(--bg-primary) font-bold text-sm hover:bg-(--accent-glow)/90 transition-all cursor-pointer"
>
  <Download className="w-4 h-4" />
  {t("downloadCta")}
</button>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl">
                      ⚠️
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {t("errorTitle")}
                  </h3>
                  <p className="text-(--text-muted) text-sm mb-6">
                    {error || t("errorGeneric")}
                  </p>
                  <button
                    onClick={handleClose}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-(--border-strong) text-white text-sm hover:bg-(--surface)/40 transition-all"
                  >
                    {t("close")}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}