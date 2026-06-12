"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { AppleSection } from "./AppleSection";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const ease = [0.16, 1, 0.3, 1] as const;
const COUNT = 6;

export function FaqSection() {
  const t = useTranslations("faq");
  const reduced = useReducedMotion() ?? false;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <AppleSection contentClassName="max-w-3xl">
      <Reveal>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} accent={t("titleAccent")} />
      </Reveal>

      <div className="mt-14 border-t border-(--apple-border)">
        {Array.from({ length: COUNT }, (_, i) => i + 1).map((n, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={n} delay={i * 0.04}>
              <div className="border-b border-(--apple-border)">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 py-6 text-left cursor-pointer group"
                >
                  <span className="text-[18px] font-medium text-(--apple-text) transition-colors group-hover:text-(--apple-accent)">
                    {t(`q${n}`)}
                  </span>
                  <span
                    className="shrink-0 text-(--apple-accent) transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    <Plus className="w-5 h-5" strokeWidth={2} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-[16px] text-(--apple-text-2) leading-relaxed max-w-2xl">{t(`a${n}`)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </AppleSection>
  );
}
