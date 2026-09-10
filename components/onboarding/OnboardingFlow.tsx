"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { saveOnboarding, skipOnboarding } from "@/lib/actions/profile";
import { GrainGradient } from "@/components/ui/GrainGradient";
import { PillAction } from "@/components/ui/Pill";
import { OnboardingStep, type Step } from "@/components/onboarding/OnboardingStep";
import type { FounderExpertise, FounderStage, FounderTime } from "@/lib/types/profile";

/**
 * L'accueil du nouveau fondateur.
 *
 * Même panneau coupé en deux que la connexion : l'adresse et la progression à
 * gauche, la question à droite sur le dégradé. Ce n'est pas une coquetterie de
 * cohérence — c'est le deuxième écran après l'inscription, et retrouver la même
 * forme dit « tu es au bon endroit, ça continue » sans avoir à l'écrire.
 *
 * Ce qui est saisi ici part dans le contexte envoyé au modèle à chaque
 * conversation. D'où la possibilité de passer : cinq questions imposées avant
 * d'avoir vu le produit font perdre plus de monde qu'un contexte incomplet.
 */
const STEPS: Step[] = ["stage", "expertise", "time", "context", "goals"];

export function OnboardingFlow() {
  const t = useTranslations("onboarding");
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [stage, setStage] = useState<FounderStage | null>(null);
  const [expertise, setExpertise] = useState<FounderExpertise | null>(null);
  const [time, setTime] = useState<FounderTime | null>(null);
  const [context, setContext] = useState("");
  const [goals, setGoals] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;
  const isLast = stepIndex === STEPS.length - 1;

  const canContinue = (): boolean => {
    switch (currentStep) {
      case "stage":
        return stage !== null;
      case "expertise":
        return expertise !== null;
      case "time":
        return time !== null;
      case "context":
        return context.trim().length >= 10;
      case "goals":
        return goals.trim().length >= 10;
    }
  };

  const handleSubmit = async () => {
    if (!stage || !expertise || !time) return;
    setSubmitting(true);
    setError(null);

    const res = await saveOnboarding({
      stage,
      expertise,
      time_commitment: time,
      founder_context: context,
      goals,
    });

    if (!res.success) {
      setSubmitting(false);
      setError(res.error ?? t("errorGeneric"));
      return;
    }
    router.push("/dashboard");
  };

  const handleNext = () => {
    if (!canContinue()) return;
    if (isLast) handleSubmit();
    else setStepIndex(stepIndex + 1);
  };

  const handleSkip = async () => {
    setSubmitting(true);
    await skipOnboarding();
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--shell) px-4 py-10 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="grid w-full max-w-4xl overflow-hidden rounded-[26px] bg-(--panel) md:grid-cols-2 md:grid-rows-[1fr_auto]"
      >
        <div className="order-1 px-7 pt-9 pb-6 md:order-none md:col-start-1 md:row-start-1 md:px-10 md:pt-12">
          <h1 className="text-balance text-[27px] leading-[1.12] font-semibold tracking-[-0.03em] text-white md:text-[32px]">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xs text-[13.5px] leading-relaxed text-white/45">
            {t("subtitle")}
          </p>

          <div className="mt-8 max-w-xs">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.16em] text-white/35 uppercase">
                {t("step", { current: stepIndex + 1, total: STEPS.length })}
              </span>
              <button
                type="button"
                onClick={handleSkip}
                disabled={submitting}
                className="cursor-pointer font-mono text-[10px] tracking-[0.16em] text-white/35 uppercase transition-colors hover:text-white disabled:opacity-50"
              >
                {t("skip")}
              </button>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-white/70"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>

        <div className="relative order-2 md:order-none md:col-start-2 md:row-span-2 md:row-start-1">
          <GrainGradient
            colorway="azure"
            seed={64}
            grain={0.6}
            className="absolute inset-0 size-full"
          />
          <div className="relative px-6 py-9 md:px-10 md:py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <OnboardingStep
                  step={currentStep}
                  stage={stage}
                  expertise={expertise}
                  time={time}
                  context={context}
                  goals={goals}
                  onStage={setStage}
                  onExpertise={setExpertise}
                  onTime={setTime}
                  onContext={setContext}
                  onGoals={setGoals}
                />
              </motion.div>
            </AnimatePresence>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-500/30 bg-white/85 px-4 py-3 text-[13px] font-medium text-red-700"
              >
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="order-3 flex gap-2 px-7 pt-2 pb-9 md:order-none md:col-start-1 md:row-start-2 md:px-10 md:pb-12">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={() => setStepIndex(stepIndex - 1)}
              disabled={submitting}
              className="h-12 cursor-pointer rounded-full border border-(--panel-line) px-6 text-[14px] font-medium text-white/55 transition-colors hover:bg-white/6 hover:text-white disabled:opacity-50"
            >
              {t("back")}
            </button>
          )}
          <PillAction
            tone="light"
            size="lg"
            onClick={handleNext}
            disabled={!canContinue() || submitting}
            className="flex-1"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                {t("saving")}
              </span>
            ) : isLast ? (
              t("finish")
            ) : (
              t("next")
            )}
          </PillAction>
        </div>
      </motion.div>
    </main>
  );
}
