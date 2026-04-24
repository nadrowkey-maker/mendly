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
  color,
  role,
  title,
  tagline,
  tags,
  deliverables,
  learnMore,
  index,
  reduced,
  scrollProgress,
}: AgentCardProps) {
  const row = Math.floor(index / 4);
  const colInRow = index % 4;
  const start = 0.45 + row * 0.1 + colInRow * 0.02;
  const end = start + 0.13;

  const cardOpacity = useTransform(scrollProgress, [start, end], [0, 1]);
  const cardY = useTransform(scrollProgress, [start, end], [60, 0]);

  return (
    <motion.div
      style={
        {
          opacity: reduced ? 1 : cardOpacity,
          y: reduced ? 0 : cardY,
          "--glow": color,
          "--glow-b": `${color}28`,
        } as CSSProperties
      }
      className="group h-full"
    >
      {/* Utilisation de transitions CSS standard pour le scale : 100x plus léger que du JS */}
      <div className="rounded-3xl border border-[var(--glow-b)] bg-(--surface)/75 backdrop-blur-md p-4 h-full transition-all duration-300 group-hover:scale-[1.02] group-hover:bg-(--surface)/90">
        <div className="flex flex-col gap-2 h-full">
          <span className="text-xl font-bold font-mono tracking-tight text-[var(--glow)]">
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
      </div>
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

  // Robot animations
  const robotScale = useTransform(scrollYProgress, [0, 0.2, 0.75], [1.1, 1.1, 0.9]);
  const robotOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8], [1, 1, 0.7]);
  const headingOpacity = useTransform(scrollYProgress, [0.2, 0.35], [0, 1]);
  const headingY = useTransform(scrollYProgress, [0.2, 0.35], [30, 0]);
  const subOpacity = useTransform(scrollYProgress, [0.32, 0.45], [0, 1]);
  const fadeOpacity = useTransform(scrollYProgress, [0, 0.45, 0.75], [0.2, 0.5, 1]);

  const cards = AGENTS.map((agent, i) => ({
    id: agent.id,
    color: agent.color,
    role: t(`${agent.id}Role`),
    title: t(`${agent.id}Title`),
    tagline: t(`${agent.id}Tagline`),
    tags: t(`${agent.id}Tags`),
    deliverables: t(`${agent.id}Deliverables`),
    learnMore,
    index: i,
    reduced,
    scrollProgress: scrollYProgress,
  }));

  return (
    <section ref={sectionRef} className="relative bg-(--bg-primary)" style={{ height: "500vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* ROBOT LAYER */}
        <motion.div 
          className="absolute inset-0 z-0" 
          style={{ scale: reduced ? 1 : robotScale, opacity: reduced ? 1 : robotOpacity }}
        >
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" 
            className="w-full h-full" 
          />
        </motion.div>

        {/* GLOWS & FADES */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(70%_60%_at_50%_45%,rgba(139,92,246,0.15)_0%,transparent_70%)]" />
        <motion.div 
          className="absolute inset-x-0 bottom-0 h-[50%] pointer-events-none z-[2] bg-linear-to-t from-(--bg-primary) via-(--bg-primary)/80 to-transparent" 
          style={{ opacity: reduced ? 1 : fadeOpacity }}
        />

        {/* TEXT CONTENT */}
        <motion.div className="absolute inset-x-0 top-[8%] z-10 px-6 text-center pointer-events-none" style={{ opacity: reduced ? 1 : headingOpacity, y: reduced ? 0 : headingY }}>
          <p className="text-[10px] tracking-[0.3em] text-(--accent-glow) uppercase mb-3">{t("eyebrow")}</p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white">
            {t("title")} <GradientText as="span"><em className="font-fraunces">{t("titleEm")}</em></GradientText>
          </h2>
        </motion.div>

        <motion.div className="absolute inset-x-0 top-[26%] z-10 px-6 text-center pointer-events-none" style={{ opacity: reduced ? 1 : subOpacity }}>
          <p className="text-sm md:text-base text-(--text-muted) max-w-2xl mx-auto">{t("sub")}</p>
        </motion.div>

        {/* CARDS GRID */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-8 md:pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {cards.map((card) => <AgentCard key={card.id} {...card} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}