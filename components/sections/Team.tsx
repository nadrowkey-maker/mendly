"use client";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  MotionValue,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef, type CSSProperties } from "react";
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
  // Cards reveal timing — after the initial pause (20%) and heading (30%).
  // Row 1 reveals 45%→60%, Row 2 reveals 55%→72%. Fully settled by 75%.
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
  const splineWrapperRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // ═══ GLOBAL MOUSE TRACKING ═══
  // Forward every mousemove on the entire section into the Spline canvas
  // so the robot's gaze follows the cursor anywhere — over cards, text, edges, all of it.
  useEffect(() => {
    if (reduced) return;

    const section = sectionRef.current;
    const splineWrapper = splineWrapperRef.current;
    if (!section || !splineWrapper) return;

    const forwardMouseEvent = (e: MouseEvent) => {
      const canvas = splineWrapper.querySelector("canvas");
      if (!canvas) return;

      const synthetic = new MouseEvent("mousemove", {
        bubbles: true,
        cancelable: true,
        clientX: e.clientX,
        clientY: e.clientY,
        screenX: e.screenX,
        screenY: e.screenY,
        view: window,
      });
      canvas.dispatchEvent(synthetic);
    };

    section.addEventListener("mousemove", forwardMouseEvent, { passive: true });
    return () => section.removeEventListener("mousemove", forwardMouseEvent);
  }, [reduced]);

  // ═══ SCROLL-DRIVEN TIMELINE ═══
  // 0–20%   : PAUSE — robot alone, full screen, pure black (the shock)
  // 20–35%  : Eyebrow + title fade in (from top)
  // 35–45%  : Sub-text fades in, robot shrinks gently
  // 45–75%  : 8 cards roll in, row by row
  // 75–100% : Everything settled, user can contemplate before moving on

  // Robot: stays big during the pause, then recedes slightly when content comes in
  const robotScale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.75, 1],
    [1.12, 1.12, 0.92, 0.92]
  );
  const robotOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [1, 1, 0.82, 0.82]
  );

  // Heading: appears AFTER the pause (20%), settled by 35%
  const headingOpacity = useTransform(scrollYProgress, [0.2, 0.35], [0, 1]);
  const headingY = useTransform(scrollYProgress, [0.2, 0.35], [40, 0]);

  // Sub-text: appears slightly after the heading
  const subOpacity = useTransform(scrollYProgress, [0.32, 0.45], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.32, 0.45], [30, 0]);

  // Bottom black fade: subtle during pause, strong once cards are in
  const fadeOpacity = useTransform(
    scrollYProgress,
    [0, 0.45, 0.75],
    [0.25, 0.55, 1]
  );

  const cards: AgentCardProps[] = [
    { id: "ceo", color: AGENTS[0].color, role: t("ceoRole"), title: t("ceoTitle"), tagline: t("ceoTagline"), tags: t("ceoTags"), deliverables: t("ceoDeliverables"), learnMore, index: 0, reduced, scrollProgress: scrollYProgress },
    { id: "cto", color: AGENTS[1].color, role: t("ctoRole"), title: t("ctoTitle"), tagline: t("ctoTagline"), tags: t("ctoTags"), deliverables: t("ctoDeliverables"), learnMore, index: 1, reduced, scrollProgress: scrollYProgress },
    { id: "cmo", color: AGENTS[2].color, role: t("cmoRole"), title: t("cmoTitle"), tagline: t("cmoTagline"), tags: t("cmoTags"), deliverables: t("cmoDeliverables"), learnMore, index: 2, reduced, scrollProgress: scrollYProgress },
    { id: "cpo", color: AGENTS[3].color, role: t("cpoRole"), title: t("cpoTitle"), tagline: t("cpoTagline"), tags: t("cpoTags"), deliverables: t("cpoDeliverables"), learnMore, index: 3, reduced, scrollProgress: scrollYProgress },
    { id: "cdo", color: AGENTS[4].color, role: t("cdoRole"), title: t("cdoTitle"), tagline: t("cdoTagline"), tags: t("cdoTags"), deliverables: t("cdoDeliverables"), learnMore, index: 4, reduced, scrollProgress: scrollYProgress },
    { id: "cfo", color: AGENTS[5].color, role: t("cfoRole"), title: t("cfoTitle"), tagline: t("cfoTagline"), tags: t("cfoTags"), deliverables: t("cfoDeliverables"), learnMore, index: 5, reduced, scrollProgress: scrollYProgress },
    { id: "dev", color: AGENTS[6].color, role: t("devRole"), title: t("devTitle"), tagline: t("devTagline"), tags: t("devTags"), deliverables: t("devDeliverables"), learnMore, index: 6, reduced, scrollProgress: scrollYProgress },
    { id: "cco", color: AGENTS[7].color, role: t("ccoRole"), title: t("ccoTitle"), tagline: t("ccoTagline"), tags: t("ccoTags"), deliverables: t("ccoDeliverables"), learnMore, index: 7, reduced, scrollProgress: scrollYProgress },
  ];

  return (
    // 500vh gives us a long journey:
    // first 100vh = pause (robot alone), the rest = progressive reveal
    <section
      ref={sectionRef}
      className="relative bg-(--bg-primary)"
      style={{ height: "500vh" }}
    >
      {/* ═══ STICKY STAGE: everything locks to the viewport while 500vh scrolls ═══ */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* ═══ LAYER 0 : ROBOT FULLSCREEN on PURE BLACK ═══ */}
        <motion.div
          ref={splineWrapperRef}
          className="absolute inset-0 z-0"
          style={{
            scale: reduced ? 1 : robotScale,
            opacity: reduced ? 1 : robotOpacity,
          }}
        >
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </motion.div>

        {/* ═══ LAYER 1 : Ambient violet glow ═══ */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 45%, rgba(139, 92, 246, 0.22) 0%, transparent 70%)",
          }}
        />

        {/* ═══ LAYER 2 : Bottom black fade (robot emerges from void) ═══ */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[50%] pointer-events-none z-[2]"
          style={{
            opacity: reduced ? 1 : fadeOpacity,
            background:
              "linear-gradient(to top, var(--bg-primary) 0%, var(--bg-primary) 25%, rgba(5, 3, 14, 0.85) 55%, rgba(5, 3, 14, 0.4) 82%, transparent 100%)",
          }}
        />

        {/* ═══ LAYER 3 : HEADING (eyebrow + title) — TOP of the screen ═══ */}
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

        {/* ═══ LAYER 4 : SUB-TEXT (just below heading) ═══ */}
        <motion.div
          className="absolute inset-x-0 top-[22%] md:top-[25%] z-10 px-6 md:px-12 text-center pointer-events-none"
          style={{
            opacity: reduced ? 1 : subOpacity,
            y: reduced ? 0 : subY,
          }}
        >
          <p className="text-sm md:text-base text-(--text-muted) max-w-2xl mx-auto drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
            {t("sub")}
          </p>
        </motion.div>

        {/* ═══ LAYER 5 : 8 CARDS (bottom, revealed progressively) ═══ */}
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