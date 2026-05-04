"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { GlowCard } from "@/components/spotlight-card";

const FADE_UP = (delay: number) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.25, 1, 0.5, 1] as const },
  viewport: { once: true, margin: "-80px" as const },
});

export function ProblemSection() {
  const t = useTranslations("problem");

  const cards = [
    { number: t("stat1Number"), title: t("stat1Title"), desc: t("stat1Desc"), glow: "purple" as const },
    { number: t("stat2Number"), title: t("stat2Title"), desc: t("stat2Desc"), glow: "blue" as const },
    { number: t("stat3Number"), title: t("stat3Title"), desc: t("stat3Desc"), glow: "red" as const },
  ];

  return (
    <section className="relative overflow-hidden py-24 md:py-40 px-6 md:px-12">
      {/* Static ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 40%, rgba(139,92,246,0.11) 0%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_50%,transparent_10%,var(--bg-primary)_72%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-(--bg-primary) to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-(--bg-primary) to-transparent pointer-events-none" />
      {/* Scanline sweep */}
      <motion.div
        className="absolute inset-x-0 h-px pointer-events-none z-0"
        style={{ background: "linear-gradient(to right, transparent 5%, rgba(139,92,246,0.35) 50%, transparent 95%)" }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 7, ease: "linear", repeat: Infinity, repeatDelay: 4 }}
      />
      {/* Second scanline offset */}
      <motion.div
        className="absolute inset-x-0 h-px pointer-events-none z-0"
        style={{ background: "linear-gradient(to right, transparent 5%, rgba(6,182,212,0.2) 50%, transparent 95%)" }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 7, ease: "linear", repeat: Infinity, repeatDelay: 4, delay: 3.5 }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
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

        {/* Mobile: horizontal swipe */}
        <div className="md:hidden -mx-6 overflow-x-auto pb-4 [scrollbar-width:none] [scroll-snap-type:x_mandatory]">
          <div className="flex gap-4 px-6 w-max">
            {cards.map(({ number, title, desc, glow }, i) => (
              <div key={i} className="w-[80vw] shrink-0 snap-start">
                <GlowCard glowColor={glow} customSize className="w-full min-h-52">
                  <div className="flex flex-col gap-3">
                    <span className="text-6xl font-bold text-white leading-none">{number}</span>
                    <p className="text-sm font-semibold text-(--text-primary)">{title}</p>
                    <p className="text-xs text-(--text-muted) leading-relaxed">{desc}</p>
                  </div>
                </GlowCard>
              </div>
            ))}
          </div>
        </div>
        {/* Desktop: 3-col grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {cards.map(({ number, title, desc, glow }, i) => (
            <motion.div key={i} {...FADE_UP(0.1 * (i + 1))}>
              <GlowCard glowColor={glow} customSize className="w-full min-h-65">
                <div className="flex flex-col gap-3">
                  <span className="text-6xl md:text-7xl font-bold text-white leading-none">
                    {number}
                  </span>
                  <p className="text-sm font-semibold text-(--text-primary)">{title}</p>
                  <p className="text-xs text-(--text-muted) leading-relaxed">{desc}</p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-(--bg-primary) to-transparent pointer-events-none" />
    </section>
  );
}
