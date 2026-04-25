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
  id,
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
  // ═══ TIMING COMPRESSÉ POUR APPARITION PRÉCOCE ═══
  const row = Math.floor(index / 4);
  const colInRow = index % 4;
  
  // L'apparition de toutes les cartes est avancée
  // Première ligne (row 0) : démarre à 22%
  // Deuxième ligne (row 1) : démarre à 30% (beaucoup plus tôt qu'avant)
  const baseStart = 0.22 + row * 0.08; 
  const start = baseStart + colInRow * 0.015;
  // L'apparition est plus rapide (12% du scroll) pour un "allumage" net
  const end = start + 0.12; 

  const cardOpacity = useTransform(scrollProgress, [start, end], [0, 1]);
  const cardY = useTransform(scrollProgress, [start, end], [14, 0]);
  const cardScale = useTransform(scrollProgress, [start, end], [0.93, 1]);

  return (
    <motion.div
      style={
        {
          opacity: reduced ? 1 : cardOpacity,
          y: reduced ? 0 : cardY,
          scale: reduced ? 1 : cardScale,
          "--glow": color,
        } as CSSProperties
      }
      className="group pointer-events-auto h-full" /* <-- 1. AJOUTE "h-full" ICI */
    >
      <TiltCard
        spotlight
        tiltLimit={10}
        scale={1.03}
        className="rounded-3xl border bg-(--surface)/85 backdrop-blur-xl p-4 transition-all duration-500 h-full flex flex-col justify-between" /* <-- 2. AJOUTE "h-full flex flex-col justify-between" ICI */
        style={{
          borderColor: `${color}66`,
          boxShadow: `0 0 60px ${color}26, inset 0 0 22px ${color}14`,
        }}
      >
        <div className="flex flex-col gap-2 min-h-40 md:min-h-45">
          <span
            className="text-2xl font-bold font-mono tracking-tight text-white"
            style={{
              color: color,
              textShadow: `0 0 28px ${color}99, 0 0 10px ${color}`,
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
            style={{ background: `${color}66` }}
          />

          <p className="font-mono text-[11px] text-white/55 leading-relaxed">
            {tags}
          </p>

          <p className="text-[11px] text-white/60 leading-relaxed mt-auto pt-1">
            {deliverables}
          </p>

          <span
            className="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-0.5 font-medium shrink-0"
            style={{ color: color }}
          >
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

  // ═ TIMINGS GÉNÉRAUX ÉTALÉS SUR 500VH ═
  
  // Le robot rétrécit sur les premiers 25%
  const robotScale = useTransform(
    scrollYProgress,
    [0, 0.25, 1],
    [2.8, 1, 0.92]
  );
  
  const robotOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.85, 1], // Le robot reste visible très longtemps
    [1, 1, 0.82, 0.82]
  );

  const headingOpacity = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);
  const headingY = useTransform(scrollYProgress, [0.05, 0.15], [40, 0]);

  const subOpacity = useTransform(scrollYProgress, [0.10, 0.20], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.10, 0.20], [30, 0]);

  // ═══ FIX DU DÉGRADÉ NOIR (LAYER 2) ═══
  // J'ai reculé massivement le dégradé pour qu'il n'assombrisse pas les cartes.
  // Toutes les cartes sont révélées avant 45% du scroll.
  // Le dégradé commence à devenir vraiment noir à partir de 80% du scroll,
  // seulement pour transitionner vers la section suivante.
  const fadeOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.45, 0.80, 0.95],
    [0.1, 0.3, 0.3, 0.3, 1] // Reste très transparent pendant la lecture
  );

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
    <section
      ref={sectionRef}
      className="relative bg-(--bg-primary)"
      style={{ height: "500vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* LAYER 0 : ROBOT */}
        <motion.div
          className="absolute inset-0 z-0 pointer-events-auto"
          style={{
            scale: reduced ? 1 : robotScale,
            opacity: reduced ? 1 : robotOpacity,
            transformOrigin: "center 45%",
          }}
        >
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </motion.div>

        {/* LAYER 1 : Ambient violet glow */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 45%, rgba(139, 92, 246, 0.22) 0%, transparent 70%)",
          }}
        />

        {/* LAYER 2 : Bottom black fade (CORRIGÉ ET DÉCALÉ) */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[35%] pointer-events-none z-[2]"
          style={{
            opacity: reduced ? 1 : fadeOpacity,
            background:
              "linear-gradient(to top, var(--bg-primary) 0%, rgba(5, 3, 14, 0.85) 50%, transparent 100%)",
          }}
        />

        {/* LAYER 3 : HEADING */}
        <motion.div
          className="absolute inset-x-0 top-[5%] md:top-[6%] z-10 px-6 md:px-12 text-center pointer-events-none"
          style={{
            opacity: reduced ? 1 : headingOpacity,
            y: reduced ? 0 : headingY,
          }}
        >
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] md:text-xs tracking-[0.3em] text-(--accent-glow) uppercase mb-3 drop-shadow-[0_0_16px_rgba(139,92,246,0.7)]">
              {t("eyebrow")}
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]">
              {t("title")}{" "}
              <GradientText as="span" className="bg-transparent dark:bg-transparent">
                <em className="font-fraunces">{t("titleEm")}</em>
              </GradientText>
            </h2>
          </div>
        </motion.div>

        {/* LAYER 4 : SUB-TEXT */}
        <motion.div
          className="absolute inset-x-0 top-[22%] md:top-[25%] z-10 px-6 md:px-12 text-center pointer-events-none"
          style={{
            opacity: reduced ? 1 : subOpacity,
            y: reduced ? 0 : subY,
          }}
        >
          <p className="text-sm md:text-base text-white/70 max-w-2xl mx-auto drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
            {t("sub")}
          </p>
        </motion.div>

        {/* LAYER 5 : 8 CARDS (pointer-events-none ajouté ici, bottom remonté) */}
        <div className="absolute inset-x-0 bottom-[8%] md:bottom-[12%] z-10 pb-6 md:pb-10 pointer-events-none">
          {/* Mobile */}
          <div className="md:hidden overflow-x-auto px-4 pb-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
            <div className="flex gap-2.5 w-max">
              {cards.map((card) => (
                <div key={card.id} className="w-44 shrink-0 pointer-events-auto">
                  <AgentCard {...card} />
                </div>
              ))}
            </div>
          </div>
          {/* Desktop */}
          <div className="hidden md:block px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-4 gap-4">
                {cards.map((card) => (
                  <AgentCard key={card.id} {...card} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}