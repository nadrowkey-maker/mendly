"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const ease = [0.25, 1, 0.5, 1] as const;

interface StatCard {
  number: string;
  title: string;
  desc: string;
}

function StatCard({ number, title, desc, index }: StatCard & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease }}
      viewport={{ once: true, margin: "-60px" }}
      className="glass-card rounded-3xl p-8 flex flex-col gap-4 hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-300"
    >
      <span className="text-7xl md:text-8xl font-bold leading-none ai-gradient-text tracking-tight">
        {number}
      </span>
      <p className="text-base font-semibold text-white/90 tracking-tight">{title}</p>
      <p className="text-[15px] text-[#86868b] leading-[1.47]">{desc}</p>
    </motion.div>
  );
}

export function ProblemSection() {
  const t = useTranslations("problem");

  const cards: StatCard[] = [
    { number: t("stat1Number"), title: t("stat1Title"), desc: t("stat1Desc") },
    { number: t("stat2Number"), title: t("stat2Title"), desc: t("stat2Desc") },
    { number: t("stat3Number"), title: t("stat3Title"), desc: t("stat3Desc") },
  ];

  return (
    <section className="relative overflow-hidden py-24 md:py-40 px-6 md:px-12 bg-black">
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="text-[13px] font-medium tracking-[0.18em] text-[#86868b] uppercase mb-6">
            {t("eyebrow")}
          </p>
          <h2 className="font-bold leading-[1.05] tracking-[-0.025em] text-white mb-6"
            style={{ fontSize: "clamp(40px, 6vw, 80px)" }}>
            {t("title")}{" "}
            <span className="text-[#86868b] font-normal">
              {t("titleEm")}
            </span>
          </h2>
          <p className="text-xl text-[#86868b] max-w-2xl mx-auto leading-[1.47]">
            {t("intro")}
          </p>
        </motion.div>

        {/* Mobile: horizontal swipe */}
        <div className="md:hidden -mx-6 overflow-x-auto pb-4 [scrollbar-width:none] [scroll-snap-type:x_mandatory]">
          <div className="flex gap-4 px-6 w-max">
            {cards.map((card, i) => (
              <div key={i} className="w-[80vw] shrink-0 snap-start">
                <StatCard {...card} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: 3-col */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <StatCard key={i} {...card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
