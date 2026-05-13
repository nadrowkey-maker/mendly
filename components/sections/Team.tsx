"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AGENTS } from "@/lib/agents";

const ease = [0.25, 1, 0.5, 1] as const;

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

function AgentCard({ color, role, title, tagline, tags, deliverables, index, reduced }: AgentCardProps) {
  return (
    <motion.div
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: reduced ? 0 : index * 0.05, ease }}
      viewport={{ once: true, margin: "-20px" }}
      className="glass-card rounded-2xl p-5 flex flex-col gap-3 h-full hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-300 group cursor-default"
    >
      {/* Role badge */}
      <span
        className="text-xs font-semibold tracking-[0.12em] uppercase"
        style={{ color }}
      >
        {role}
      </span>

      <p className="text-[11px] text-[#6E6E73] tracking-[0.12em] uppercase font-medium">
        {title}
      </p>

      <p className="text-sm text-white/75 leading-relaxed italic font-fraunces">
        {tagline}
      </p>

      <div className="h-px w-8 bg-[rgba(255,255,255,0.08)] mt-1" />

      <p className="text-[11px] text-[#6E6E73] leading-relaxed font-mono">
        {tags}
      </p>

      <p className="text-[11px] text-[#6E6E73] leading-relaxed mt-auto pt-1">
        {deliverables}
      </p>
    </motion.div>
  );
}

export function TeamSection() {
  const t = useTranslations("team");
  const reduced = useReducedMotion() ?? false;

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
    <section id="team" className="relative scroll-mt-20 bg-black min-h-screen overflow-hidden flex flex-col py-24 md:py-32">
      {/* Subtle ambient orb */}
      <div
        className="absolute top-1/2 left-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
        style={{
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(ellipse at center, rgba(191,90,242,0.07) 0%, rgba(10,132,255,0.04) 50%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col flex-1 px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center max-w-3xl mx-auto w-full mb-4"
        >
          <p className="text-[13px] font-medium tracking-[0.18em] text-[#86868b] uppercase mb-6">
            {t("eyebrow")}
          </p>
          <h2 className="font-bold leading-[1.05] tracking-tight text-white"
            style={{ fontSize: "clamp(36px, 5.5vw, 72px)" }}>
            {t("title")}{" "}
            <span className="ai-gradient-text">{t("titleEm")}</span>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center text-xl text-[#86868b] max-w-xl mx-auto mb-16 leading-[1.47]"
        >
          {t("sub")}
        </motion.p>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden overflow-x-auto pb-4 [scrollbar-width:none] [scroll-snap-type:x_mandatory]">
          <div className="flex gap-3 w-max px-4">
            {cards.map((card) => (
              <div key={card.id} className="w-64 shrink-0 snap-start">
                <AgentCard {...card} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: 4-column grid */}
        <div className="hidden md:grid grid-cols-4 gap-4 max-w-7xl mx-auto w-full">
          {cards.map((card) => (
            <AgentCard key={card.id} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
