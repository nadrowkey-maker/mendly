"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { saveOnboarding, skipOnboarding } from "@/lib/actions/profile";
import { PremiumButton } from "@/components/ui/PremiumButton";
import type {
  FounderExpertise,
  FounderStage,
  FounderTime,
} from "@/lib/types/profile";

type Step = "stage" | "expertise" | "time" | "context" | "goals";

const STEPS: Step[] = ["stage", "expertise", "time", "context", "goals"];

export function OnboardingFlow() {
  const t = useTranslations("onboarding");
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [stage, setStage] = useState<FounderStage | null>(null);
  const [expertise, setExpertise] = useState<FounderExpertise | null>(null);
  const [timeCommitment, setTimeCommitment] = useState<FounderTime | null>(null);
  const [founderContext, setFounderContext] = useState("");
  const [goals, setGoals] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const canContinue = (): boolean => {
    switch (currentStep) {
      case "stage":
        return stage !== null;
      case "expertise":
        return expertise !== null;
      case "time":
        return timeCommitment !== null;
      case "context":
        return founderContext.trim().length >= 10;
      case "goals":
        return goals.trim().length >= 10;
    }
  };

  const handleNext = () => {
    if (!canContinue()) return;
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleSubmit = async () => {
    if (!stage || !expertise || !timeCommitment) return;
    setSubmitting(true);
    setError(null);

    const res = await saveOnboarding({
      stage,
      expertise,
      time_commitment: timeCommitment,
      founder_context: founderContext,
      goals,
    });

    if (!res.success) {
      setSubmitting(false);
      setError(res.error ?? t("errorGeneric"));
      return;
    }

    router.push("/dashboard");
  };

  const handleSkip = async () => {
    setSubmitting(true);
    await skipOnboarding();
    router.push("/dashboard");
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-16 bg-(--bg-primary)">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,113,227,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-mono tracking-[0.3em] text-(--accent-glow) uppercase mb-3">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-sm text-(--text-muted)">{t("subtitle")}</p>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono text-(--text-dim) uppercase tracking-wider">
              {t("step", { current: stepIndex + 1, total: STEPS.length })}
            </span>
            <button
              type="button"
              onClick={handleSkip}
              disabled={submitting}
              className="text-[10px] font-mono text-(--text-dim) hover:text-white uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {t("skip")}
            </button>
          </div>
          <div className="h-1 bg-(--border) rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-(--accent-glow) rounded-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-(--border-strong) bg-(--surface)/40 backdrop-blur-xl p-6 md:p-8 min-h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentStep === "stage" && (
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {t("stageQuestion")}
                  </h2>
                  <p className="text-sm text-(--text-muted) mb-6">{t("stageHelp")}</p>
                  <div className="space-y-2">
                    {(["first_time", "second_time", "experienced"] as FounderStage[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStage(s)}
                        className={`w-full text-left px-4 py-4 rounded-xl border transition-all cursor-pointer ${
                          stage === s
                            ? "border-(--accent-glow) bg-(--accent-glow)/10"
                            : "border-(--border) bg-(--bg-primary)/30 hover:border-(--border-strong)"
                        }`}
                      >
                        <p className="text-sm font-semibold text-white mb-0.5">
                          {t(`stage_${s}_label`)}
                        </p>
                        <p className="text-xs text-(--text-muted)">
                          {t(`stage_${s}_desc`)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === "expertise" && (
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {t("expertiseQuestion")}
                  </h2>
                  <p className="text-sm text-(--text-muted) mb-6">{t("expertiseHelp")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["tech", "business", "design", "marketing", "mixed", "none"] as FounderExpertise[]).map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setExpertise(e)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
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
              )}

              {currentStep === "time" && (
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {t("timeQuestion")}
                  </h2>
                  <p className="text-sm text-(--text-muted) mb-6">{t("timeHelp")}</p>
                  <div className="space-y-2">
                    {(["weekend", "parttime", "fulltime"] as FounderTime[]).map((tc) => (
                      <button
                        key={tc}
                        type="button"
                        onClick={() => setTimeCommitment(tc)}
                        className={`w-full text-left px-4 py-4 rounded-xl border transition-all cursor-pointer ${
                          timeCommitment === tc
                            ? "border-(--accent-glow) bg-(--accent-glow)/10"
                            : "border-(--border) bg-(--bg-primary)/30 hover:border-(--border-strong)"
                        }`}
                      >
                        <p className="text-sm font-semibold text-white mb-0.5">
                          {t(`time_${tc}_label`)}
                        </p>
                        <p className="text-xs text-(--text-muted)">
                          {t(`time_${tc}_desc`)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === "context" && (
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {t("contextQuestion")}
                  </h2>
                  <p className="text-sm text-(--text-muted) mb-6">{t("contextHelp")}</p>
                  <textarea
                    value={founderContext}
                    onChange={(e) => setFounderContext(e.target.value)}
                    rows={6}
                    maxLength={2000}
                    placeholder={t("contextPlaceholder")}
                    className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--bg-primary)/50 text-white placeholder-(--text-dim) focus:outline-none focus:border-(--accent-glow) focus:ring-2 focus:ring-(--accent-glow)/20 transition-all resize-none"
                  />
                  <p className="text-[10px] text-(--text-dim) mt-2 font-mono">
                    {founderContext.length}/2000
                  </p>
                </div>
              )}

              {currentStep === "goals" && (
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {t("goalsQuestion")}
                  </h2>
                  <p className="text-sm text-(--text-muted) mb-6">{t("goalsHelp")}</p>
                  <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    rows={6}
                    maxLength={2000}
                    placeholder={t("goalsPlaceholder")}
                    className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--bg-primary)/50 text-white placeholder-(--text-dim) focus:outline-none focus:border-(--accent-glow) focus:ring-2 focus:ring-(--accent-glow)/20 transition-all resize-none"
                  />
                  <p className="text-[10px] text-(--text-dim) mt-2 font-mono">
                    {goals.length}/2000
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div
              role="alert"
              className="mt-4 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm"
            >
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="px-5 py-3 rounded-full border border-(--border-strong) text-(--text-muted) hover:text-white hover:bg-(--surface) transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              {t("back")}
            </button>
          )}
          <PremiumButton
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={!canContinue() || submitting}
            className="flex-1"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("saving")}
              </span>
            ) : stepIndex === STEPS.length - 1 ? (
              <span className="flex items-center gap-2">
                {t("finish")}
                <ArrowRight className="w-4 h-4" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {t("next")}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </PremiumButton>
        </div>
      </div>
    </main>
  );
}
