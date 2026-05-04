"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Users, MessageSquareMore, FileText, Layers } from "lucide-react";
import { GlowCard } from "@/components/spotlight-card";

const CARDS = [
  { icon: Users, colorVar: "--accent-primary", glow: "purple" as const },
  { icon: MessageSquareMore, colorVar: "--accent-hot", glow: "blue" as const },
  { icon: FileText, colorVar: "--accent-warm", glow: "orange" as const },
  { icon: Layers, colorVar: "--accent-glow", glow: "green" as const },
] as const;

export function WhatYouGetSection() {
  const t = useTranslations("whatYouGet");

  const cards = [
    { title: t("card1Title"), desc: t("card1Desc"), ...CARDS[0] },
    { title: t("card2Title"), desc: t("card2Desc"), ...CARDS[1] },
    { title: t("card3Title"), desc: t("card3Desc"), ...CARDS[2] },
    { title: t("card4Title"), desc: t("card4Desc"), ...CARDS[3] },
  ];

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-[0.15em] text-(--accent-glow) mb-4 uppercase">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold text-(--text-primary) leading-[0.95] tracking-[-0.03em]">
            {t("title")}{" "}
            <span className="italic font-(family-name:--font-fraunces) bg-linear-to-r from-(--accent-glow) to-(--accent-warm) bg-clip-text text-transparent">
              {t("titleEm")}
            </span>
          </h2>
        </motion.div>

        {/* Mobile: horizontal swipe */}
        <div className="md:hidden -mx-6 overflow-x-auto pb-4 [scrollbar-width:none] [scroll-snap-type:x_mandatory]">
          <div className="flex gap-4 px-6 w-max">
            {cards.map(({ icon: Icon, colorVar, glow, title, desc }, i) => (
              <div key={i} className="w-[80vw] shrink-0 snap-start">
                <GlowCard glowColor={glow} customSize className="w-full p-6">
                  <div className="flex flex-col gap-3">
                    <div
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl"
                      style={{ background: `color-mix(in srgb, var(${colorVar}) 15%, transparent)` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: `var(${colorVar})` }} strokeWidth={1.75} />
                    </div>
                    <h3 className="text-lg font-semibold text-(--text-primary) tracking-tight">{title}</h3>
                    <p className="text-sm text-(--text-muted) leading-relaxed">{desc}</p>
                  </div>
                </GlowCard>
              </div>
            ))}
          </div>
        </div>
        {/* Desktop: 2-col grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {cards.map(({ icon: Icon, colorVar, glow, title, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-60px" }}
            >
              <GlowCard glowColor={glow} customSize className="w-full p-7">
                <div className="flex flex-col gap-3">
                  <div
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl"
                    style={{ background: `color-mix(in srgb, var(${colorVar}) 15%, transparent)` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: `var(${colorVar})` }} strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-semibold text-(--text-primary) tracking-tight">{title}</h3>
                  <p className="text-sm text-(--text-muted) leading-relaxed">{desc}</p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
