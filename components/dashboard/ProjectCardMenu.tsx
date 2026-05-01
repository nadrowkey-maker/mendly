"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { deleteProject } from "@/lib/actions/projects";
import type { Project } from "@/lib/types/project";

interface Props {
  project: Project;
  onEdit: (project: Project) => void;
  onDeleted: (projectId: string) => void;
}

export function ProjectCardMenu({ project, onEdit, onDeleted }: Props) {
  const t = useTranslations("projectMenu");
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
    }
  }, [open]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setConfirming(false);
      }
    };
    if (open) {
      document.addEventListener("keydown", onEsc);
      return () => document.removeEventListener("keydown", onEsc);
    }
  }, [open]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    onEdit(project);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    const res = await deleteProject(project.id);
    setDeleting(false);
    if (res.success) {
      onDeleted(project.id);
      setOpen(false);
      setConfirming(false);
    } else {
      alert(res.error ?? "Erreur");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label={t("ariaLabel")}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-(--text-dim) hover:text-white hover:bg-(--surface) transition-colors cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-9 z-30 w-48 rounded-xl border border-(--border-strong) bg-(--bg-primary)/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {!confirming ? (
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-(--text-muted) hover:text-white hover:bg-(--surface) transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {t("edit")}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t("delete")}
                </button>
              </div>
            ) : (
              <div className="p-3 space-y-2.5">
                <p className="text-xs text-(--text-muted) leading-relaxed">
                  {t("confirmDelete")}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirming(false);
                    }}
                    disabled={deleting}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border border-(--border-strong) text-(--text-muted) hover:text-white hover:bg-(--surface) transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/30 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {t("deleting")}
                      </>
                    ) : (
                      t("confirm")
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
