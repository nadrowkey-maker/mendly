"use client";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRef, type CSSProperties } from "react";
import { AGENTS } from "@/lib/agents";
import { SplineScene } from "@/components/ui/splite";
import { TiltCard } from "@/components/ui/tilt-card";
import { GradientText } from "@/components/ui/gradient-text";

interface AgentCardProps {
  id: string;
  color: string;
  role: string;
  title: string;
  tagline: string;
  tags: string;
  deliverables: string;
  index: number;
  reduced: boolean;
}

function AgentCard({
  color,
  role,
  title,
  tagline,
  tags,
  deliverables,
  index,
  reduced,
}: AgentCardProps) {
  return (
    <motion.div
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: reduced ? 0 : index * 0.05,
        ease: [0.25, 1, 0.5, 1],
      }}
      viewport={{ once: true, margin: "-20px" }}
      className="group pointer-events-auto h-full"
      style={{ "--glow": color } as CSSProperties}
    >
      <TiltCard
        spotlight
        tiltLimit={8}
        scale={1.02}
        className="rounded-2xl border bg-(--surface)/90 p-4 transition-all duration-300 h-full flex flex-col justify-between"
        style={{
          borderColor: `${color}55`,
          boxShadow: `0 0 40px ${color}1A`,
        }}
      >
        <div className="flex flex-col gap-2 min-h-40 md:min-h-45">
          <span
            className="text-2xl font-bold font-mono tracking-tight"
            style={{
              color: color,
              textShadow: `0 0 20px ${color}80`,
            }}
          >
            {role}
          </span>

          <p className="text-[10px] text-white/70 tracking-[0.15em] uppercase font-medium">
            {title}
          </p>

          <p className="font-fraunces italic text-sm text-white/85 leading-relaxed">
            {tagline}
          </p>

          <div
            className="w-10 h-px my-1 shrink-0"
            style={{ background: `${color}55` }}
          />

          <p className="font-mono text-[11px] text-white/55 leading-relaxed">
            {tags}
          </p>

          <p className="text-[11px] text-white/60 leading-relaxed mt-auto pt-1">
            {deliverables}
          </p>

        </div>
      </TiltCard>
    </motion.div>
  );
}

export function TeamSection() {
  const t = useTranslations("team");
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "0px", once: true });

  const cards = AGENTS.map((agent, index) => ({
    id: agent.id,
    color: agent.color,
    role: t(`${agent.id}Role`),
    title: t(`${agent.id}Title`),
    tagline: t(`${agent.id}Tagline`),
    tags: t(`${agent.id}Tags`),
    deliverables: t(`${agent.id}Deliverables`),
    index,
    reduced,
  }));

  return (
    <section
      id="team"
      ref={sectionRef}
      className="relative scroll-mt-20 bg-(--bg-primary) min-h-screen overflow-hidden flex flex-col"
    >
      {/* SplineScene — full background */}
      <div className="absolute inset-0 z-0">
        {isInView && (
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        )}
      </div>

      {/* Ambient violet glow */}
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 45%, rgba(139,92,246,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Bottom gradient so cards are readable over the 3D scene */}
      <div
        className="absolute inset-x-0 bottom-0 h-3/5 z-2 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, var(--bg-primary) 0%, rgba(17,17,19,0.92) 45%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 md:px-12 py-16 md:py-20 pointer-events-none">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center max-w-4xl mx-auto w-full"
        >
          <p className="text-sm font-semibold tracking-[0.15em] text-(--accent-glow) uppercase mb-3 drop-shadow-[0_0_16px_rgba(139,92,246,0.7)]">
            {t("eyebrow")}
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]">
            {t("title")}{" "}
            <GradientText as="span" className="bg-transparent dark:bg-transparent">
              <em className="font-fraunces">{t("titleEm")}</em>
            </GradientText>
          </h2>
        </motion.div>

        {/* Sub-text — always visible, never scroll-gated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center mt-4 mb-auto"
        >
          <p className="text-sm md:text-base text-white/70 max-w-2xl mx-auto drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
            {t("sub")}
          </p>
        </motion.div>

        {/* 8 agent cards */}
        <div className="mt-auto pt-8 w-full">
          {/* Mobile: horizontal scroll */}
          <div className="md:hidden overflow-x-auto pb-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
            <div className="flex gap-2.5 w-max px-2">
              {cards.map((card) => (
                <div key={card.id} className="w-44 shrink-0">
                  <AgentCard {...card} />
                </div>
              ))}
            </div>
          </div>
          {/* Desktop: 4-column grid */}
          <div className="hidden md:block max-w-7xl mx-auto">
            <div className="grid grid-cols-4 gap-4">
              {cards.map((card) => (
                <AgentCard key={card.id} {...card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
