"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { FileText, Download, Trash2, Loader2 } from "lucide-react";
import {
  getDeliverableDownloadUrl,
  deleteDeliverable,
  type DeliverableWithUrl,
} from "@/lib/actions/deliverables";
import type { Project } from "@/lib/types/project";

interface Props {
  project: Project;
  deliverables: DeliverableWithUrl[];
}

const AGENT_COLOR: Record<string, string> = {
  CEO: "#0071e3",
  CTO: "#06B6D4",
  CMO: "#F0ABFC",
};

export function DeliverablesListClient({ project, deliverables: initial }: Props) {
  const t = useTranslations("deliverablesList");
  const [items, setItems] = useState(initial);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleDownload = async (filePath: string | null, id: string) => {
    if (!filePath) return;
    setDownloading(id);
    try {
      const url = await getDeliverableDownloadUrl(filePath);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (id: string, filePath: string | null) => {
    if (!confirm(t("confirmDelete"))) return;
    setDeleting(id);
    try {
      const res = await deleteDeliverable(id, filePath);
      if (res.success) {
        startTransition(() => {
          setItems((prev) => prev.filter((d) => d.id !== id));
        });
      }
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="relative min-h-screen px-6 md:px-12 py-12 bg-(--bg-primary)">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(0,113,227,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="text-xs font-mono tracking-widest text-(--text-dim) hover:text-white uppercase transition-colors inline-block mb-6"
          >
            ← {t("backToChat")}
          </Link>

          <p className="text-[10px] font-mono tracking-[0.3em] text-(--accent-glow) uppercase mb-2">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-(--text-muted) text-sm">
            {project.name}
          </p>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-(--border-strong) bg-(--surface)/40 backdrop-blur-xl p-12 text-center"
          >
            <div className="text-5xl mb-4">📄</div>
            <h2 className="text-xl font-bold text-white mb-2">
              {t("emptyTitle")}
            </h2>
            <p className="text-(--text-muted) text-sm mb-6 max-w-sm mx-auto">
              {t("emptyBody")}
            </p>
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-(--accent-glow) text-(--bg-primary) font-bold text-sm hover:bg-(--accent-glow)/90 transition-all"
            >
              {t("backToChat")}
            </Link>
          </motion.div>
        ) : (
          // List
          <div className="space-y-3">
            {items.map((d, i) => {
              const color = AGENT_COLOR[d.agent_role] ?? "#0071e3";
              const date = new Date(d.created_at).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="group flex items-center gap-4 rounded-2xl border border-(--border-strong) bg-(--surface)/40 backdrop-blur-xl p-4 hover:border-(--accent-glow)/40 transition-all"
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${color}15`,
                      border: `1px solid ${color}40`,
                    }}
                  >
                    <FileText className="w-5 h-5" style={{ color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-mono font-bold tracking-wider uppercase"
                        style={{ color }}
                      >
                        {d.agent_role}
                      </span>
                      <span className="text-[10px] font-mono text-(--text-dim) uppercase">
                        · {d.type}
                      </span>
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-white truncate">
                      {d.title}
                    </h3>
                    <p className="text-xs text-(--text-dim) mt-0.5">{date}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {d.file_path && (
                      <button
                        onClick={() => handleDownload(d.file_path, d.id)}
                        disabled={downloading === d.id}
                        className="p-2.5 rounded-xl border border-(--border-strong) text-(--text-muted) hover:text-white hover:border-(--accent-glow)/50 hover:bg-(--surface)/60 transition-all disabled:opacity-50 cursor-pointer"
                        title={t("download")}
                      >
                        {downloading === d.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(d.id, d.file_path)}
                      disabled={deleting === d.id}
                      className="p-2.5 rounded-xl border border-(--border-strong) text-(--text-muted) hover:text-red-300 hover:border-red-500/50 hover:bg-red-500/10 transition-all disabled:opacity-50 cursor-pointer"
                      title={t("delete")}
                    >
                      {deleting === d.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}