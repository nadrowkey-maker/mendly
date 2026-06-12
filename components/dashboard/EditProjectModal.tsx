"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { updateProject } from "@/lib/actions/projects";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { MilestoneCelebration } from "@/components/dashboard/MilestoneCelebration";

const STAGE_ORDER: ProjectStage[] = ["idea", "mvp", "launched", "scaling"];
import type {
  Project,
  ProjectSector,
  ProjectStage,
  ProjectPriority,
  ProjectTimeCommitment,
} from "@/lib/types/project";

interface Props {
  project: Project | null;
  onClose: () => void;
  onUpdated: (project: Project) => void;
}

export function EditProjectModal({ project, onClose, onUpdated }: Props) {
  const t = useTranslations("newProject");
  const tEdit = useTranslations("editProject");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sector, setSector] = useState<ProjectSector>("tech");
  const [stage, setStage] = useState<ProjectStage>("idea");
  const [priority, setPriority] = useState<ProjectPriority>("strategy");
  const [timeCommitment, setTimeCommitment] = useState<ProjectTimeCommitment>("parttime");

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [celebration, setCelebration] = useState<{ from: string; to: string } | null>(null);

  useEffect(() => {
    if (!project) return;
    setName(project.name);
    setDescription(project.description ?? "");
    setSector(project.sector ?? "tech");
    setStage(project.stage);
    setPriority(project.priority ?? "strategy");
    setTimeCommitment(project.time_commitment ?? "parttime");
    setStatus("idle");
    setErrorMsg("");
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [project, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setStatus("loading");
    setErrorMsg("");

    const res = await updateProject(project.id, {
      name,
      description: description || null,
      sector,
      stage,
      priority,
      time_commitment: timeCommitment,
    });

    if (!res.success || !res.project) {
      setStatus("error");
      setErrorMsg(res.error ?? tEdit("errorGeneric"));
      return;
    }

    onUpdated(res.project);

    // Bloc 8.3 — celebrate when the project advances a stage.
    const advanced = STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(project.stage);
    if (advanced) {
      setCelebration({ from: t(`stage_${project.stage}`), to: t(`stage_${stage}`) });
    } else {
      onClose();
    }
  };

  return (
    <>
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-3xl border border-(--border-strong) bg-(--bg-primary)/95 backdrop-blur-xl p-6 md:p-8 my-auto"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-(--text-dim) hover:text-white hover:bg-(--surface) transition-colors cursor-pointer"
              aria-label={tEdit("close")}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <p className="text-[10px] font-mono tracking-[0.3em] text-(--accent-glow) uppercase mb-2">
                {tEdit("eyebrow")}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {tEdit("title")}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {status === "error" && errorMsg && (
                <div
                  role="alert"
                  className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm"
                >
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="edit-name"
                  className="text-xs font-mono tracking-widest text-(--text-dim) uppercase"
                >
                  {t("nameLabel")} *
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  disabled={status === "loading"}
                  className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--bg-primary)/50 text-white placeholder-(--text-dim) focus:outline-none focus:border-(--accent-glow) focus:ring-2 focus:ring-(--accent-glow)/20 transition-all disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-desc"
                  className="text-xs font-mono tracking-widest text-(--text-dim) uppercase"
                >
                  {t("descriptionLabel")}
                </label>
                <textarea
                  id="edit-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  disabled={status === "loading"}
                  className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--bg-primary)/50 text-white placeholder-(--text-dim) focus:outline-none focus:border-(--accent-glow) focus:ring-2 focus:ring-(--accent-glow)/20 transition-all disabled:opacity-50 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest text-(--text-dim) uppercase">
                  {t("stageLabel")}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(["idea", "mvp", "launched", "scaling"] as ProjectStage[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStage(s)}
                      disabled={status === "loading"}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-mono uppercase tracking-wide transition-all cursor-pointer ${
                        stage === s
                          ? "border-(--accent-glow) bg-(--accent-glow)/10 text-(--accent-glow)"
                          : "border-(--border) bg-(--bg-primary)/30 text-(--text-muted) hover:border-(--border-strong)"
                      }`}
                    >
                      {t(`stage_${s}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-sector"
                  className="text-xs font-mono tracking-widest text-(--text-dim) uppercase"
                >
                  {t("sectorLabel")}
                </label>
                <select
                  id="edit-sector"
                  value={sector}
                  onChange={(e) => setSector(e.target.value as ProjectSector)}
                  disabled={status === "loading"}
                  className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--bg-primary)/50 text-white focus:outline-none focus:border-(--accent-glow) focus:ring-2 focus:ring-(--accent-glow)/20 transition-all disabled:opacity-50"
                >
                  <option value="tech">{t("sector_tech")}</option>
                  <option value="consumer">{t("sector_consumer")}</option>
                  <option value="b2b">{t("sector_b2b")}</option>
                  <option value="ecommerce">{t("sector_ecommerce")}</option>
                  <option value="media">{t("sector_media")}</option>
                  <option value="other">{t("sector_other")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest text-(--text-dim) uppercase">
                  {t("priorityLabel")}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(["strategy", "tech", "marketing", "growth"] as ProjectPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      disabled={status === "loading"}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-mono uppercase tracking-wide transition-all cursor-pointer ${
                        priority === p
                          ? "border-(--accent-glow) bg-(--accent-glow)/10 text-(--accent-glow)"
                          : "border-(--border) bg-(--bg-primary)/30 text-(--text-muted) hover:border-(--border-strong)"
                      }`}
                    >
                      {t(`priority_${p}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest text-(--text-dim) uppercase">
                  {t("timeLabel")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["weekend", "parttime", "fulltime"] as ProjectTimeCommitment[]).map((tc) => (
                    <button
                      key={tc}
                      type="button"
                      onClick={() => setTimeCommitment(tc)}
                      disabled={status === "loading"}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-mono uppercase tracking-wide transition-all cursor-pointer ${
                        timeCommitment === tc
                          ? "border-(--accent-glow) bg-(--accent-glow)/10 text-(--accent-glow)"
                          : "border-(--border) bg-(--bg-primary)/30 text-(--text-muted) hover:border-(--border-strong)"
                      }`}
                    >
                      {t(`time_${tc}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={status === "loading"}
                  className="flex-1 px-5 py-3 rounded-full border border-(--border-strong) text-(--text-muted) hover:text-white hover:bg-(--surface) transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {tEdit("cancel")}
                </button>
                <PremiumButton
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={status === "loading"}
                  className="flex-1"
                >
                  {status === "loading" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {tEdit("saving")}
                    </span>
                  ) : (
                    tEdit("save")
                  )}
                </PremiumButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {celebration && (
        <MilestoneCelebration
          fromLabel={celebration.from}
          toLabel={celebration.to}
          onDone={() => {
            setCelebration(null);
            onClose();
          }}
        />
      )}
    </AnimatePresence>
    </>
  );
}
