"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { createProject } from "@/lib/actions/projects";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { useSearchParams } from "next/navigation";
import type {
  ProjectSector,
  ProjectStage,
  ProjectPriority,
  ProjectTimeCommitment,
} from "@/lib/types/project";
import { PrivacyReassurance } from "@/components/project/PrivacyReassurance";

const COLORS = ["#0071e3", "#5b9dff", "#34d8b4", "#f472b6", "#fbbf24", "#fb7185", "#818cf8", "#38bdf8"];
const EMOJIS = ["🚀", "💡", "🧪", "📱", "🛍️", "🎯", "🧠", "⚡", "🌱", "🎨", "📦", "🔭"];

export default function NewProjectPage() {
  const t = useTranslations("newProject");
  const router = useRouter();
  const searchParams = useSearchParams();
  const nameRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const desc = searchParams.get("desc");
    if (desc) setDescription(decodeURIComponent(desc));
    nameRef.current?.focus();
  }, [searchParams]);
  const [sector, setSector] = useState<ProjectSector>("tech");
  const [stage, setStage] = useState<ProjectStage>("idea");
  const [priority, setPriority] = useState<ProjectPriority>("strategy");
  const [timeCommitment, setTimeCommitment] =
    useState<ProjectTimeCommitment>("parttime");
  const [accentColor, setAccentColor] = useState(COLORS[0]);
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [vision, setVision] = useState("");

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
      accent_color: accentColor,
      emoji,
      vision: vision || undefined,
    });

    if (!result.success) {
      setStatus("error");
      if (result.error?.startsWith("plan_limit:")) {
        const limit = result.error.split(":")[1];
        setErrorMsg(t("errorProjectLimit", { limit }));
      } else {
        setErrorMsg(result.error || t("errorGeneric"));
      }
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
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(0,113,227,0.06) 0%, transparent 70%)",
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
              ref={nameRef}
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

          {/* Vision (Bloc 8.3) */}
          <div className="space-y-2">
            <label htmlFor="vision" className="text-xs font-mono tracking-widest text-(--text-dim) uppercase">
              {t("visionLabel")}
            </label>
            <textarea
              id="vision"
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              maxLength={300}
              rows={2}
              disabled={status === "loading"}
              placeholder={t("visionPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--bg-primary)/50 text-white placeholder-(--text-dim) focus:outline-none focus:border-(--accent-glow) focus:ring-2 focus:ring-(--accent-glow)/20 transition-all disabled:opacity-50 resize-none"
            />
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

          {/* Identity */}
          <div className="space-y-3">
            <label className="text-xs font-mono tracking-widest text-(--text-dim) uppercase">
              {t("identityLabel")}
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <div
                className="grid place-items-center h-12 w-12 rounded-2xl text-2xl shrink-0"
                style={{ background: `${accentColor}1f`, border: `1px solid ${accentColor}66` }}
              >
                {emoji || "•"}
              </div>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAccentColor(c)}
                    aria-label={`Color ${c}`}
                    className="h-7 w-7 rounded-full transition-transform hover:scale-110 cursor-pointer"
                    style={{
                      background: c,
                      outline: accentColor === c ? "2px solid #fff" : "none",
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  aria-label={`Emoji ${e}`}
                  className={`h-9 w-9 rounded-xl text-lg grid place-items-center cursor-pointer transition-colors ${
                    emoji === e ? "bg-(--surface-3)" : "hover:bg-(--surface-2)"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-(--text-dim)">{t("identityHint")}</p>
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

        <PrivacyReassurance className="mt-6 max-w-2xl mx-auto" />
      </div>
    </main>
  );
}