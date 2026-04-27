"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { createProject } from "@/lib/actions/projects";
import { PremiumButton } from "@/components/ui/PremiumButton";
import type {
  ProjectSector,
  ProjectStage,
  ProjectPriority,
  ProjectTimeCommitment,
} from "@/lib/types/project";

export default function NewProjectPage() {
  const t = useTranslations("newProject");
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sector, setSector] = useState<ProjectSector>("tech");
  const [stage, setStage] = useState<ProjectStage>("idea");
  const [priority, setPriority] = useState<ProjectPriority>("strategy");
  const [timeCommitment, setTimeCommitment] =
    useState<ProjectTimeCommitment>("parttime");

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const result = await createProject({
      name,
      description: description || undefined,
      sector,
      stage,
      priority,
      time_commitment: timeCommitment,
    });

    if (!result.success) {
      setStatus("error");
      setErrorMsg(result.error || t("errorGeneric"));
      return;
    }

    // Redirect to dashboard after creation
    router.push("/dashboard");
  };

  return (
    <main className="relative min-h-screen px-6 md:px-12 py-12 bg-(--bg-primary)">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(139,92,246,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="text-xs font-mono tracking-widest text-(--text-dim) hover:text-white uppercase transition-colors inline-block mb-8"
        >
          ← {t("back")}
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-[10px] font-mono tracking-[0.3em] text-(--accent-glow) uppercase mb-2">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t("title")}
          </h1>
          <p className="text-(--text-muted)">{t("subtitle")}</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="rounded-3xl border border-(--border-strong) bg-(--surface)/40 backdrop-blur-xl p-6 md:p-8 space-y-6"
        >
          {status === "error" && errorMsg && (
            <div
              role="alert"
              className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm"
            >
              {errorMsg}
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-xs font-mono tracking-widest text-(--text-dim) uppercase"
            >
              {t("nameLabel")} *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              disabled={status === "loading"}
              placeholder={t("namePlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--bg-primary)/50 text-white placeholder-(--text-dim) focus:outline-none focus:border-(--accent-glow) focus:ring-2 focus:ring-(--accent-glow)/20 transition-all disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-xs font-mono tracking-widest text-(--text-dim) uppercase"
            >
              {t("descriptionLabel")}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              disabled={status === "loading"}
              placeholder={t("descriptionPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--bg-primary)/50 text-white placeholder-(--text-dim) focus:outline-none focus:border-(--accent-glow) focus:ring-2 focus:ring-(--accent-glow)/20 transition-all disabled:opacity-50 resize-none"
            />
            <p className="text-[10px] text-(--text-dim)">
              {description.length}/500
            </p>
          </div>

          {/* Stage */}
          <div className="space-y-2">
            <label className="text-xs font-mono tracking-widest text-(--text-dim) uppercase">
              {t("stageLabel")}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(["idea", "mvp", "launched", "scaling"] as ProjectStage[]).map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStage(s)}
                    disabled={status === "loading"}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-mono uppercase tracking-wide transition-all ${
                      stage === s
                        ? "border-(--accent-glow) bg-(--accent-glow)/10 text-(--accent-glow)"
                        : "border-(--border) bg-(--bg-primary)/30 text-(--text-muted) hover:border-(--border-strong)"
                    }`}
                  >
                    {t(`stage_${s}`)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <label
              htmlFor="sector"
              className="text-xs font-mono tracking-widest text-(--text-dim) uppercase"
            >
              {t("sectorLabel")}
            </label>
            <select
              id="sector"
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

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-xs font-mono tracking-widest text-(--text-dim) uppercase">
              {t("priorityLabel")}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(
                ["strategy", "tech", "marketing", "growth"] as ProjectPriority[]
              ).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  disabled={status === "loading"}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-mono uppercase tracking-wide transition-all ${
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

          {/* Time commitment */}
          <div className="space-y-2">
            <label className="text-xs font-mono tracking-widest text-(--text-dim) uppercase">
              {t("timeLabel")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                ["weekend", "parttime", "fulltime"] as ProjectTimeCommitment[]
              ).map((tc) => (
                <button
                  key={tc}
                  type="button"
                  onClick={() => setTimeCommitment(tc)}
                  disabled={status === "loading"}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-mono uppercase tracking-wide transition-all ${
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

          {/* Submit */}
          <div className="pt-2">
            <PremiumButton
              variant="primary"
              size="lg"
              type="submit"
              disabled={status === "loading"}
              className="w-full"
            >
              {status === "loading" ? t("ctaLoading") : t("cta")}
            </PremiumButton>
          </div>
        </motion.form>
      </div>
    </main>
  );
}