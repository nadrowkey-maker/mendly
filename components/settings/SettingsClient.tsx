"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, ExternalLink } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";
import { deleteAccount } from "@/lib/actions/account";
import { PremiumButton } from "@/components/ui/PremiumButton";
import type {
  UserProfile,
  FounderExpertise,
  FounderStage,
  FounderTime,
} from "@/lib/types/profile";

interface Props {
  userEmail: string;
  profile: UserProfile | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
  hasActiveSubscription: boolean;
}

export function SettingsClient({
  userEmail,
  profile,
  subscriptionPlan,
  subscriptionStatus,
  hasActiveSubscription,
}: Props) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();

  const [stage, setStage] = useState<FounderStage | null>(profile?.stage ?? null);
  const [expertise, setExpertise] = useState<FounderExpertise | null>(
    profile?.expertise ?? null
  );
  const [timeCommitment, setTimeCommitment] = useState<FounderTime | null>(
    profile?.time_commitment ?? null
  );
  const [founderContext, setFounderContext] = useState(profile?.founder_context ?? "");
  const [goals, setGoals] = useState(profile?.goals ?? "");

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [portalLoading, setPortalLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSaved(false);

    const res = await updateProfile({
      stage: stage ?? undefined,
      expertise: expertise ?? undefined,
      time_commitment: timeCommitment ?? undefined,
      founder_context: founderContext,
      goals,
    });

    setProfileSaving(false);
    if (!res.success) {
      setProfileError(res.error ?? t("errorGeneric"));
      return;
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Portal error");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setPortalLoading(false);
      alert(t("portalError"));
    }
  };

  const canConfirmDelete = deleteConfirmText.trim().toUpperCase() === t("deleteConfirmWord");

  const handleDeleteAccount = async () => {
    if (!canConfirmDelete) return;
    setDeleting(true);
    setDeleteError(null);

    const res = await deleteAccount();
    if (!res.success) {
      setDeleting(false);
      setDeleteError(res.error ?? t("errorGeneric"));
      return;
    }

    window.location.href = "/";
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

      <div className="relative z-10 max-w-3xl mx-auto">
        <Link
          href="/dashboard"
          className="text-xs font-mono tracking-widest text-(--text-dim) hover:text-white uppercase transition-colors inline-block mb-8"
        >
          ← {t("backToDashboard")}
        </Link>

        <header className="mb-10">
          <p className="text-[10px] font-mono tracking-[0.3em] text-(--accent-glow) uppercase mb-2">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-(--text-muted) text-sm">{t("subtitle")}</p>
        </header>

        {/* ACCOUNT */}
        <section className="mb-10 rounded-3xl border border-(--border-strong) bg-(--surface)/40 backdrop-blur-xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-white mb-1">{t("accountTitle")}</h2>
          <p className="text-xs text-(--text-muted) mb-5">{t("accountSubtitle")}</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-(--border)">
              <span className="text-xs font-mono tracking-widest text-(--text-dim) uppercase">
                {t("emailLabel")}
              </span>
              <span className="text-sm text-white">{userEmail}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-xs font-mono tracking-widest text-(--text-dim) uppercase">
                {t("planLabel")}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white capitalize">
                  {subscriptionPlan}
                </span>
                {subscriptionPlan !== "free" && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-(--accent-glow)">
                    {subscriptionStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* PROFILE */}
        <section className="mb-10 rounded-3xl border border-(--border-strong) bg-(--surface)/40 backdrop-blur-xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-white mb-1">{t("profileTitle")}</h2>
          <p className="text-xs text-(--text-muted) mb-6">{t("profileSubtitle")}</p>

          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-(--text-dim) uppercase">
                {t("stageLabel")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["first_time", "second_time", "experienced"] as FounderStage[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStage(s)}
                    disabled={profileSaving}
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
              <label className="text-xs font-mono tracking-widest text-(--text-dim) uppercase">
                {t("expertiseLabel")}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(["tech", "business", "design", "marketing", "mixed", "none"] as FounderExpertise[]).map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setExpertise(e)}
                    disabled={profileSaving}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-mono uppercase tracking-wide transition-all cursor-pointer ${
                      expertise === e
                        ? "border-(--accent-glow) bg-(--accent-glow)/10 text-(--accent-glow)"
                        : "border-(--border) bg-(--bg-primary)/30 text-(--text-muted) hover:border-(--border-strong)"
                    }`}
                  >
                    {t(`expertise_${e}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-(--text-dim) uppercase">
                {t("timeLabel")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["weekend", "parttime", "fulltime"] as FounderTime[]).map((tc) => (
                  <button
                    key={tc}
                    type="button"
                    onClick={() => setTimeCommitment(tc)}
                    disabled={profileSaving}
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

            <div className="space-y-2">
              <label
                htmlFor="founder-context"
                className="text-xs font-mono tracking-widest text-(--text-dim) uppercase"
              >
                {t("contextLabel")}
              </label>
              <textarea
                id="founder-context"
                value={founderContext}
                onChange={(e) => setFounderContext(e.target.value)}
                rows={4}
                maxLength={2000}
                disabled={profileSaving}
                placeholder={t("contextPlaceholder")}
                className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--bg-primary)/50 text-white placeholder-(--text-dim) focus:outline-none focus:border-(--accent-glow) focus:ring-2 focus:ring-(--accent-glow)/20 transition-all disabled:opacity-50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="goals"
                className="text-xs font-mono tracking-widest text-(--text-dim) uppercase"
              >
                {t("goalsLabel")}
              </label>
              <textarea
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={4}
                maxLength={2000}
                disabled={profileSaving}
                placeholder={t("goalsPlaceholder")}
                className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--bg-primary)/50 text-white placeholder-(--text-dim) focus:outline-none focus:border-(--accent-glow) focus:ring-2 focus:ring-(--accent-glow)/20 transition-all disabled:opacity-50 resize-none"
              />
            </div>

            {profileError && (
              <div
                role="alert"
                className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm"
              >
                {profileError}
              </div>
            )}

            <div className="flex items-center gap-4">
              <PremiumButton
                variant="primary"
                size="md"
                type="submit"
                disabled={profileSaving}
              >
                {profileSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("saving")}
                  </span>
                ) : (
                  t("saveProfile")
                )}
              </PremiumButton>
              <AnimatePresence>
                {profileSaved && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-mono uppercase tracking-wider text-emerald-400"
                  >
                    ✓ {t("saved")}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </form>
        </section>

        {/* BILLING */}
        <section className="mb-10 rounded-3xl border border-(--border-strong) bg-(--surface)/40 backdrop-blur-xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-white mb-1">{t("billingTitle")}</h2>
          <p className="text-xs text-(--text-muted) mb-5">{t("billingSubtitle")}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            {subscriptionPlan === "free" ? (
              <Link href="/upgrade">
                <PremiumButton variant="primary" size="md">
                  {t("seePlans")}
                </PremiumButton>
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-(--border-strong) text-white hover:bg-(--surface) transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("loading")}
                  </>
                ) : (
                  <>
                    {t("manageBilling")}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </section>

        {/* DANGER ZONE */}
        <section className="mb-10 rounded-3xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="text-lg font-bold text-red-300">{t("dangerTitle")}</h2>
          </div>
          <p className="text-xs text-(--text-muted) mb-5">{t("dangerSubtitle")}</p>

          {hasActiveSubscription && (
            <div className="px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-200 text-sm mb-4">
              {t("blockedByActiveSub")}
            </div>
          )}

          {!deleteOpen ? (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={hasActiveSubscription}
              className="px-5 py-2.5 rounded-full border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("deleteAccount")}
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-white">
                {t("deleteConfirmInstruction", {
                  word: t("deleteConfirmWord"),
                })}
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                disabled={deleting}
                placeholder={t("deleteConfirmWord")}
                className="w-full px-4 py-3 rounded-xl border border-red-500/40 bg-(--bg-primary)/50 text-white placeholder-(--text-dim) focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all disabled:opacity-50"
              />
              {deleteError && (
                <div
                  role="alert"
                  className="px-4 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-red-200 text-sm"
                >
                  {deleteError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeleteConfirmText("");
                    setDeleteError(null);
                  }}
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-full border border-(--border-strong) text-(--text-muted) hover:text-white hover:bg-(--surface) transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={!canConfirmDelete || deleting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-200 hover:bg-red-500/30 transition-colors text-sm font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("deleting")}
                    </>
                  ) : (
                    t("confirmDelete")
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
