"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { GradientText } from "@/components/ui/gradient-text";

interface DeliverableItem {
  icon: string;
  title: string;
  meta: string;
}

function DeliverableCard({ icon, title, meta }: DeliverableItem) {
  return (
    <div className="shrink-0 w-52 md:w-60 rounded-3xl bg-(--surface)/80 backdrop-blur-sm border border-(--border) p-5 flex flex-col gap-3 hover:border-(--border-strong) hover:shadow-[0_0_24px_rgba(139,92,246,0.35)] hover:scale-110 hover:z-10 transition-all duration-300 select-none cursor-pointer relative">
      <span className="text-3xl leading-none">{icon}</span>
      <p className="font-semibold text-white text-sm leading-snug">{title}</p>
      <p className="font-mono text-[11px] text-(--text-dim) leading-relaxed">{meta}</p>
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
    <section className="relative overflow-hidden py-24 md:py-40 bg-(--bg-primary)">
      {/* Edge fades */}
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-(--bg-secondary) to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-(--bg-secondary) to-transparent pointer-events-none" />
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(139,92,246,0.08)_0%,transparent_70%)] pointer-events-none" />
      {/* Aurora orbs */}
      <div className="absolute left-[25%] top-[50%] w-125 h-75 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px] opacity-20 pointer-events-none" style={{ background: "#8B5CF6" }} />
      <div className="absolute left-[75%] top-[50%] w-110 h-70 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-15 pointer-events-none" style={{ background: "#06B6D4" }} />
      <div className="absolute left-[50%] top-[30%] w-90 h-60 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] opacity-15 pointer-events-none" style={{ background: "#F0ABFC" }} />

      {/* Heading */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center mb-16 md:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <p className="text-sm font-semibold tracking-[0.15em] text-(--accent-glow) uppercase mb-6">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-6">
            {t("title")}{" "}
            <GradientText as="span" className="bg-transparent dark:bg-transparent">
              <em className="font-fraunces">{t("titleEm")}</em>
            </GradientText>
          </h2>
          <p className="text-lg md:text-xl text-(--text-muted)">{t("sub")}</p>
        </motion.div>
      </div>

      {/* Perspective marquee */}
      <div className="relative z-10 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="[perspective:1400px]">
          <div className="[transform:rotateX(-5deg)] space-y-3 py-2">

            {/* Row 1 — scrolls right */}
            <div className="group/r1 overflow-visible">
              <div
                className={`flex gap-3 w-max ${
                  reduced ? "" : "animate-[marquee-right_34s_linear_infinite]"
                } group-hover/r1:[animation-play-state:paused]`}
              >
                {row1.map((item, i) => (
                  <DeliverableCard key={`r1-${i}`} {...item} />
                ))}
              </div>
            </div>

            {/* Row 2 — scrolls left */}
            <div className="group/r2 overflow-visible">
              <div
                className={`flex gap-3 w-max ${
                  reduced ? "" : "animate-[marquee-left_28s_linear_infinite]"
                } group-hover/r2:[animation-play-state:paused]`}
              >
                {row2.map((item, i) => (
                  <DeliverableCard key={`r2-${i}`} {...item} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
