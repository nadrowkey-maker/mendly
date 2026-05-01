"use client";
import { useRef } from "react"; // AJOUT
import { motion, useInView } from "framer-motion"; // AJOUT de useInView
import { useTranslations } from "next-intl";
import { ShaderCanvas, SHADER_SRC } from "@/components/phosphor-30";
import { GlowCard } from "@/components/spotlight-card";

const FADE_UP = (delay: number) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.25, 1, 0.5, 1] as const },
  viewport: { once: true, margin: "-80px" as const },
});

export function ProblemSection() {
  const t = useTranslations("problem");
  
  // SÉCURITÉ
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "0px" });

  const cards = [
    {
      number: t("stat1Number"),
      title: t("stat1Title"),
      desc: t("stat1Desc"),
      glow: "purple" as const,
    },
    {
      number: t("stat2Number"),
      title: t("stat2Title"),
      desc: t("stat2Desc"),
      glow: "blue" as const,
    },
    {
      number: t("stat3Number"),
      title: t("stat3Title"),
      desc: t("stat3Desc"),
      glow: "red" as const,
    },
  ];

  return (
    // ATTACHE LA RÉFÉRENCE ICI
    <section ref={sectionRef} className="relative overflow-hidden py-24 md:py-40 px-6 md:px-12">
      {/* Phosphor background */}
      <div className="absolute inset-0 opacity-[0.32] pointer-events-none">
        {isInView && <ShaderCanvas fragSource={SHADER_SRC} />}
      </div>

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_50%,transparent_10%,var(--bg-primary)_72%)] pointer-events-none" />

      {/* Top edge fade */}
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-(--bg-primary) to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div {...FADE_UP(0)} className="text-center mb-16 md:mb-24">
          <p className="text-xs tracking-[0.3em] text-(--text-dim) uppercase mb-6">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-(--text-primary)">
            {t("title")}{" "}
            <em className="font-fraunces text-(--text-muted)">
              {t("titleEm")}
            </em>
          </h2>
          <p className="mt-6 text-base md:text-lg text-(--text-muted) max-w-2xl mx-auto leading-relaxed">
            {t("intro")}
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {cards.map(({ number, title, desc, glow }, i) => (
            <motion.div key={i} {...FADE_UP(0.1 * (i + 1))}>
              <GlowCard glowColor={glow} customSize className="w-full min-h-[260px]">
                <div className="flex flex-col gap-3">
                  <span className="text-6xl md:text-7xl font-bold text-white leading-none">
                    {number}
                  </span>
                  <p className="text-sm font-semibold text-(--text-primary)">
                    {title}
                  </p>
                  <p className="text-xs text-(--text-muted) leading-relaxed">
                    {desc}
                  </p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom edge fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-(--bg-primary) to-transparent pointer-events-none" />
    </section>
  );
}