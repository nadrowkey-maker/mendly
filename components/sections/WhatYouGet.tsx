"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Users, MessageSquareMore, FileText, Layers } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const CARDS = [
  { icon: Users,              accent: "#BF5AF2" },
  { icon: MessageSquareMore,  accent: "#0A84FF" },
  { icon: FileText,           accent: "#FF375F" },
  { icon: Layers,             accent: "#30D158" },
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
    <section className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden bg-black">
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium tracking-[0.18em] text-[#86868b] uppercase mb-6">
            {t("eyebrow")}
          </p>
          <h2 className="font-bold leading-[1.05] tracking-tight text-white"
            style={{ fontSize: "clamp(40px, 6vw, 80px)" }}>
            {t("title")}{" "}
            <span className="ai-gradient-text">{t("titleEm")}</span>
          </h2>
        </motion.div>

        {/* Mobile: horizontal swipe */}
        <div className="md:hidden -mx-6 overflow-x-auto pb-4 [scrollbar-width:none] [scroll-snap-type:x_mandatory]">
          <div className="flex gap-4 px-6 w-max">
            {cards.map(({ icon: Icon, accent, title, desc }, i) => (
              <div key={i} className="w-[80vw] shrink-0 snap-start">
                <div className="glass-card rounded-3xl p-6 flex flex-col gap-4 h-full">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: `${accent}14` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: accent }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
                  <p className="text-sm text-[#6E6E73] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: 2×2 grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-4">
          {cards.map(({ icon: Icon, accent, title, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.07, ease }}
              viewport={{ once: true, margin: "-60px" }}
              className="glass-card rounded-3xl p-8 flex flex-col gap-4 hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-300 group"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: `${accent}14` }}
              >
                <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" style={{ color: accent }} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
              <p className="text-sm text-[#6E6E73] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
