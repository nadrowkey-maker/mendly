"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

const ease = [0.25, 1, 0.5, 1] as const;

interface DeliverableItem {
  icon: string;
  title: string;
  meta: string;
}

function DeliverableCard({ icon, title, meta }: DeliverableItem) {
  return (
    <div className="shrink-0 w-52 md:w-60 glass-card rounded-2xl p-5 flex flex-col gap-3 hover:bg-[rgba(255,255,255,0.07)] hover:scale-[1.03] hover:z-10 transition-all duration-300 select-none cursor-default">
      <span className="text-2xl leading-none">{icon}</span>
      <p className="font-semibold text-white/90 text-sm leading-snug">{title}</p>
      <p className="font-mono text-[11px] text-[#6E6E73] leading-relaxed">{meta}</p>
    </div>
  );
}

export function DeliverablesSection() {
  const t = useTranslations("deliverables");
  const reduced = useReducedMotion() ?? false;

  const items: DeliverableItem[] = [
    { icon: t("item1Icon"), title: t("item1Title"), meta: t("item1Meta") },
    { icon: t("item2Icon"), title: t("item2Title"), meta: t("item2Meta") },
    { icon: t("item3Icon"), title: t("item3Title"), meta: t("item3Meta") },
    { icon: t("item4Icon"), title: t("item4Title"), meta: t("item4Meta") },
    { icon: t("item5Icon"), title: t("item5Title"), meta: t("item5Meta") },
    { icon: t("item6Icon"), title: t("item6Title"), meta: t("item6Meta") },
    { icon: t("item7Icon"), title: t("item7Title"), meta: t("item7Meta") },
    { icon: t("item8Icon"), title: t("item8Title"), meta: t("item8Meta") },
  ];

  const row1 = [...items, ...items];
  const row2 = [...items].reverse().concat([...items].reverse());

  return (
    <section className="relative overflow-hidden py-24 md:py-40 bg-black">
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black to-transparent pointer-events-none" />

      {/* Heading */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center mb-16 md:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <p className="text-[13px] font-medium tracking-[0.18em] text-[#86868b] uppercase mb-6">
            {t("eyebrow")}
          </p>
          <h2 className="font-bold leading-[1.05] tracking-tight text-white mb-6"
            style={{ fontSize: "clamp(40px, 6vw, 80px)" }}>
            {t("title")}{" "}
            <span className="ai-gradient-text">{t("titleEm")}</span>
          </h2>
          <p className="text-xl text-[#86868b] leading-[1.47]">{t("sub")}</p>
        </motion.div>
      </div>

      {/* Mobile: 2-col grid */}
      <div className="md:hidden relative z-10 px-4 grid grid-cols-2 gap-3">
        {items.map(({ icon, title, meta }, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 flex flex-col gap-2">
            <span className="text-xl leading-none">{icon}</span>
            <p className="font-semibold text-white/90 text-xs leading-snug">{title}</p>
            <p className="font-mono text-[10px] text-[#6E6E73] leading-relaxed">{meta}</p>
          </div>
        ))}
      </div>

      {/* Desktop: perspective marquee */}
      <div className="hidden md:block relative z-10 mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="perspective-[1400px]">
          <div className="transform-[rotateX(-4deg)] space-y-3 py-2">
            {/* Row 1 — left */}
            <div className="group/r1 overflow-visible">
              <div className={`flex gap-3 w-max ${reduced ? "" : "animate-[marquee-left_36s_linear_infinite]"} group-hover/r1:[animation-play-state:paused]`}>
                {row1.map((item, i) => <DeliverableCard key={`r1-${i}`} {...item} />)}
              </div>
            </div>
            {/* Row 2 — right */}
            <div className="group/r2 overflow-visible">
              <div className={`flex gap-3 w-max ${reduced ? "" : "animate-[marquee-right_30s_linear_infinite]"} group-hover/r2:[animation-play-state:paused]`}>
                {row2.map((item, i) => <DeliverableCard key={`r2-${i}`} {...item} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
