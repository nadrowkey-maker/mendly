"use client";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  MotionValue,
} from "framer-motion";
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
  learnMore: string;
  index: number;
  reduced: boolean;
  scrollProgress: MotionValue<number>;
}

function AgentCard({
  id, color, role, title, tagline, tags, deliverables, learnMore, index, reduced, scrollProgress,
}: AgentCardProps) {
  // L'algorithme d'apparition mathématique que tu avais créé (intouché)
  const row = Math.floor(index / 4);
  const colInRow = index % 4;
  const baseStart = 0.45 + row * 0.1;
  const start = baseStart + colInRow * 0.02;
  const end = start + 0.13;

  const cardOpacity = useTransform(scrollProgress, [start, end], [0, 1]);
  const cardY = useTransform(scrollProgress, [start, end], [80, 0]);
  const cardScale = useTransform(scrollProgress, [start, end], [0.85, 1]);

  return (
    <motion.div
      style={
        {
          opacity: reduced ? 1 : cardOpacity,
          y: reduced ? 0 : cardY,
          scale: reduced ? 1 : cardScale,
          "--glow": color,
          "--glow-b": `${color}28`,
        } as CSSProperties
      }
      className="group h-full"
    >
      <TiltCard
        spotlight
        tiltLimit={10}
        scale={1.03}
        className="rounded-3xl border border-[var(--glow-b)] bg-(--surface)/75 backdrop-blur-xl p-4 h-full"
      >
        <div className="flex flex-col gap-2 h-full">
          <span className="text-xl font-bold font-mono tracking-tight text-[var(--glow)] drop-shadow-[0_0_14px_var(--glow)]">
            {role}
          </span>
          <p className="text-[9px] text-(--text-dim) tracking-[0.15em] uppercase">
            {title}
          </p>
          <p className="font-fraunces italic text-xs text-(--text-muted) leading-relaxed">
            {tagline}
          </p>
          <div className="w-8 h-px bg-[var(--glow-b)] my-0.5" />
          <p className="font-mono text-[10px] text-(--text-dim) leading-relaxed">
            {tags}
          </p>
          <p className="text-[10px] text-(--text-dim) leading-relaxed mt-auto pt-1">
            {deliverables}
          </p>
          <span className="text-[11px] text-[var(--glow)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-0.5">
            {learnMore}
          </span>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export function TeamSection() {
  const t = useTranslations("team");
  const reduced = useReducedMotion() ?? false;
  const learnMore = t("learnMore");

  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Les transformations de scroll originales
  const robotScale = useTransform(scrollYProgress, [0, 0.2, 0.75, 1], [1.12, 1.12, 0.92, 0.92]);
  const robotOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 1, 0.82, 0.82]);
  const headingOpacity = useTransform(scrollYProgress, [0.2, 0.35], [0, 1]);
  const headingY = useTransform(scrollYProgress, [0.2, 0.35], [40, 0]);
  const subOpacity = useTransform(scrollYProgress, [0.32, 0.45], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.32, 0.45], [30, 0]);
  const fadeOpacity = useTransform(scrollYProgress, [0, 0.45, 0.75], [0.25, 0.55, 1]);

  const cards = AGENTS.map((agent, index) => ({
    id: agent.id,
    color: agent.color,
    role: t(`${agent.id}Role`),
    title: t(`${agent.id}Title`),
    tagline: t(`${agent.id}Tagline`),
    tags: t(`${agent.id}Tags`),
    deliverables: t(`${agent.id}Deliverables`),
    learnMore,
    index,
    reduced,
    scrollProgress: scrollYProgress,
  }));

  return (
    <section ref={sectionRef} className="relative bg-(--bg-primary)" style={{ height: "500vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* LAYER 0 : ROBOT */}
        {/* ASTUCE DE PRO : On masque la div avec "none" si on ne la voit plus, ça arrête le rendu Spline ! */}
        <motion.div 
          className="absolute inset-0 z-0" 
          style={{ 
            scale: reduced ? 1 : robotScale, 
            opacity: reduced ? 1 : robotOpacity,
          }}
        >
          <SplineScene scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" className="w-full h-full" />
        </motion.div>

        {/* LAYER 1 : Ambient violet glow */}
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(70% 60% at 50% 45%, rgba(139, 92, 246, 0.22) 0%, transparent 70%)" }} />

        {/* LAYER 2 : Bottom black fade */}
        <motion.div className="absolute inset-x-0 bottom-0 h-[50%] pointer-events-none z-[2]" style={{ opacity: reduced ? 1 : fadeOpacity, background: "linear-gradient(to top, var(--bg-primary) 0%, var(--bg-primary) 25%, rgba(5, 3, 14, 0.85) 55%, rgba(5, 3, 14, 0.4) 82%, transparent 100%)" }} />

        {/* LAYER 3 : HEADING */}
        <motion.div className="absolute inset-x-0 top-[5%] md:top-[6%] z-10 px-6 md:px-12 text-center pointer-events-none" style={{ opacity: reduced ? 1 : headingOpacity, y: reduced ? 0 : headingY }}>
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] md:text-xs tracking-[0.3em] text-(--accent-glow) uppercase mb-3 drop-shadow-[0_0_16px_rgba(139,92,246,0.7)]">
              {t("eyebrow")}
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]">
              {t("title")} <GradientText as="span" className="bg-transparent dark:bg-transparent"><em className="font-fraunces">{t("titleEm")}</em></GradientText>
            </h2>
          </div>
        </motion.div>

        {/* LAYER 4 : SUB-TEXT */}
        <motion.div className="absolute inset-x-0 top-[22%] md:top-[25%] z-10 px-6 md:px-12 text-center pointer-events-none" style={{ opacity: reduced ? 1 : subOpacity, y: reduced ? 0 : subY }}>
          <p className="text-sm md:text-base text-(--text-muted) max-w-2xl mx-auto drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
            {t("sub")}
          </p>
        </motion.div>

        {/* LAYER 5 : 8 CARDS */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 md:px-8 pb-8 md:pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5 md:gap-3">
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