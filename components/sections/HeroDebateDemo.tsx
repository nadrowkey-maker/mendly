"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

type Line =
  | { kind: "founder"; key: "demoQuestion" }
  | { kind: "agent"; key: "demoCmo" | "demoCfo" | "demoCto"; role: string }
  | { kind: "verdict"; key: "demoVerdict"; role: string };

const SEQUENCE: Line[] = [
  { kind: "founder", key: "demoQuestion" },
  { kind: "agent", key: "demoCmo", role: "CMO" },
  { kind: "agent", key: "demoCfo", role: "CFO" },
  { kind: "agent", key: "demoCto", role: "CTO" },
  { kind: "verdict", key: "demoVerdict", role: "CEO" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroDebateDemo() {
  const t = useTranslations("hero");
  const reduced = useReducedMotion() ?? false;
  const [step, setStep] = useState(reduced ? SEQUENCE.length : 0);

  useEffect(() => {
    if (reduced) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = (current: number) => {
      if (current >= SEQUENCE.length) timer = setTimeout(() => setStep(0), 3400);
      else timer = setTimeout(() => setStep(current + 1), current === 0 ? 900 : 1500);
    };
    tick(step);
    return () => clearTimeout(timer);
  }, [step, reduced]);

  const visible = SEQUENCE.slice(0, step);

  return (
    <div
      className="card-apple w-full p-4 sm:p-5"
      style={{ boxShadow: "0 40px 80px -40px rgba(0,0,0,0.3)" }}
    >
      <div className="flex items-center justify-between px-1 pb-4 mb-1 border-b border-(--apple-border)">
        <span className="text-[12px] font-medium text-(--apple-text-2)">{t("demoLive")}</span>
        <div className="flex -space-x-1.5">
          {["CEO", "CTO", "CMO", "CFO"].map((r) => (
            <span
              key={r}
              className="grid place-items-center h-5 w-5 rounded-full text-[7px] font-semibold bg-(--apple-text) text-(--apple-bg) border-2 border-(--apple-bg-soft)"
            >
              {r[0]}
            </span>
          ))}
        </div>
      </div>

      <div className="h-[330px] flex flex-col gap-2.5 pt-2 overflow-hidden">
        <AnimatePresence initial={false}>
          {visible.map((line) => {
            if (line.kind === "founder") {
              return (
                <motion.div
                  key={line.key}
                  layout
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease }}
                  className="self-end max-w-[80%]"
                >
                  <div className="rounded-2xl rounded-br-md px-4 py-2.5 bg-(--apple-text) text-(--apple-bg) text-[14px]">
                    {t(line.key)}
                  </div>
                </motion.div>
              );
            }
            if (line.kind === "verdict") {
              return (
                <motion.div
                  key={line.key}
                  layout
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease }}
                  className="mt-1 rounded-2xl p-4"
                  style={{ background: "rgba(0,113,227,0.08)", border: "1px solid rgba(0,113,227,0.28)" }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="grid place-items-center h-6 w-6 rounded-lg text-[10px] font-semibold text-white bg-(--apple-accent)">
                      {line.role[0]}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide font-semibold text-(--apple-accent)">
                      {t("demoVerdictLabel")}
                    </span>
                    <Check className="w-3.5 h-3.5 ml-auto text-(--apple-accent)" strokeWidth={3} />
                  </div>
                  <p className="text-[15px] font-medium text-(--apple-text) leading-snug">{t(line.key)}</p>
                </motion.div>
              );
            }
            return (
              <motion.div
                key={line.key}
                layout
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease }}
                className="flex items-start gap-2.5 max-w-[90%]"
              >
                <span className="shrink-0 grid place-items-center h-7 w-7 rounded-lg text-[9px] font-semibold bg-(--apple-text) text-(--apple-bg)">
                  {line.role}
                </span>
                <div className="rounded-2xl rounded-tl-md px-4 py-2.5 bg-(--apple-elev) border border-(--apple-border) text-(--apple-text-2) text-[14px]">
                  {t(line.key)}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
