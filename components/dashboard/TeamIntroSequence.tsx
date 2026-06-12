"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AGENTS } from "@/lib/agents";
import { AgentOrb } from "@/components/chat/AgentOrb";
import type { AgentId } from "@/lib/agents";

interface TeamIntroSequenceProps {
  projectId: string;
  onDone: () => void;
}

const STORAGE_KEY = "mendly:team_intro_seen";
const STEP_DURATION = 3200;

export function TeamIntroSequence({ projectId, onDone }: TeamIntroSequenceProps) {
  const t = useTranslations("teamIntro");
  const reduced = useReducedMotion() ?? false;
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setVisible(true);
  }, [projectId]);

  useEffect(() => {
    if (!visible) return;
    if (step >= AGENTS.length) {
      handleDone();
      return;
    }
    const timer = setTimeout(
      () => setStep((s) => s + 1),
      reduced ? 800 : STEP_DURATION
    );
    return () => clearTimeout(timer);
  }, [step, visible, reduced]);

  const handleDone = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    onDone();
  };

  if (!visible) return null;

  const currentAgent = AGENTS[step];

  const introTexts: Record<AgentId, string> = {
    ceo: t("ceoIntro"),
    cto: t("ctoIntro"),
    cmo: t("cmoIntro"),
    cpo: t("cpoIntro"),
    cdo: t("cdoIntro"),
    cfo: t("cfoIntro"),
    dev: t("devIntro"),
    cco: t("ccoIntro"),
  };

  return (
    <AnimatePresence>
      <motion.div
        key="team-intro-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="relative w-full max-w-md"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        >
          {/* Skip button */}
          <button
            onClick={handleDone}
            className="absolute -top-10 right-0 text-xs font-mono tracking-widest text-white/40 hover:text-white/70 transition-colors cursor-pointer uppercase"
          >
            {t("skip")} â†’
          </button>

          {/* Card */}
          <div
            className="rounded-3xl border p-8 text-center"
            style={{
              background: "rgba(20,20,24,0.96)",
              borderColor: "rgba(0,113,227,0.20)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Header (step 0 only) */}
            {step === 0 && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-[11px] font-mono tracking-[0.25em] text-[#0071e3] uppercase mb-3">
                  {t("title")}
                </p>
                <p className="text-sm text-white/50">{t("sub")}</p>
              </motion.div>
            )}

            {/* Agent intro */}
            <AnimatePresence mode="wait">
              {currentAgent && (
                <motion.div
                  key={currentAgent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                  className="flex flex-col items-center gap-5"
                >
                  <AgentOrb agentId={currentAgent.id as AgentId} size={80} />
                  <p
                    className="text-[11px] font-mono tracking-[0.15em] uppercase"
                    style={{ color: currentAgent.color }}
                  >
                    {currentAgent.id.toUpperCase()}
                  </p>
                  <p className="text-white/75 text-sm leading-relaxed max-w-xs italic font-fraunces">
                    &ldquo;{introTexts[currentAgent.id as AgentId]}&rdquo;
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mt-8">
              {AGENTS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 16 : 4,
                    height: 4,
                    background: i <= step ? "rgba(0,113,227,0.85)" : "rgba(255,255,255,0.12)",
                  }}
                />
              ))}
            </div>

            {/* Skip / finish CTA */}
            <button
              onClick={handleDone}
              className="mt-6 text-xs font-mono tracking-widest text-white/30 hover:text-white/60 transition-colors cursor-pointer uppercase"
            >
              {t("letsGo")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

