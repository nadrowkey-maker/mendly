"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { Globe } from "@/components/ui/cobe-globe";
import { GradientText } from "@/components/ui/gradient-text";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Globe as GlobeIcon } from "lucide-react";
import { Link } from "@/i18n/routing";

const markers = [
  { id: "seoul", label: "Seoul", location: [37.5665, 126.978] as [number, number], size: 0.1 },
  { id: "busan", label: "Busan", location: [35.1796, 129.0756] as [number, number], size: 0.07 },
  { id: "paris", label: "Paris", location: [48.8566, 2.3522] as [number, number], size: 0.05 },
  { id: "la", label: "LA", location: [34.0522, -118.2437] as [number, number], size: 0.05 },
  { id: "tokyo", label: "Tokyo", location: [35.6762, 139.6503] as [number, number], size: 0.05 },
];

export function Trust() {
  const t = useTranslations("trust");
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // ═══ SCROLL-DRIVEN TIMELINE ═══
  // 0–25%   : Globe alone, fullscreen, centered. THE shock moment.
  // 25–45%  : Title + subtitle fade in at the top
  // 45–70%  : Globe shrinks and moves down to bottom-center
  // 70–90%  : 3 horizontal cards reveal one by one
  // 90–100% : Everything settled

  // Globe: starts huge centered, ends smaller bottom-centered
  const globeScale = useTransform(
    scrollYProgress,
    [0, 0.25, 0.7, 1],
    [1.4, 1.4, 0.6, 0.6]
  );
  const globeY = useTransform(
    scrollYProgress,
    [0, 0.25, 0.7, 1],
    ["0%", "0%", "30%", "30%"]
  );
  const globeOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.95, 1],
    [0.7, 1, 1, 0.9]
  );

  // Title + subtitle: appear after the initial shock
  const headingOpacity = useTransform(scrollYProgress, [0.25, 0.45], [0, 1]);
  const headingY = useTransform(scrollYProgress, [0.25, 0.45], [40, 0]);

  // 3 cards: horizontal reveal, staggered
  const card1Opacity = useTransform(scrollYProgress, [0.7, 0.8], [0, 1]);
  const card1Y = useTransform(scrollYProgress, [0.7, 0.8], [40, 0]);

  const card2Opacity = useTransform(scrollYProgress, [0.74, 0.84], [0, 1]);
  const card2Y = useTransform(scrollYProgress, [0.74, 0.84], [40, 0]);

  const card3Opacity = useTransform(scrollYProgress, [0.78, 0.88], [0, 1]);
  const card3Y = useTransform(scrollYProgress, [0.78, 0.88], [40, 0]);

  const cards = [
    {
      icon: Shield,
      title: t("card1Title"),
      desc: t("card1Desc"),
      color: "var(--accent-glow)",
      glowRgb: "139, 92, 246",
      opacity: card1Opacity,
      y: card1Y,
    },
    {
      icon: Zap,
      title: t("card2Title"),
      desc: t("card2Desc"),
      color: "var(--accent-hot)",
      glowRgb: "6, 182, 212",
      opacity: card2Opacity,
      y: card2Y,
    },
    {
      icon: GlobeIcon,
      title: t("card3Title"),
      desc: t("card3Desc"),
      color: "var(--accent-warm)",
      glowRgb: "240, 171, 252",
      opacity: card3Opacity,
      y: card3Y,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="trust"
      className="relative bg-(--bg-primary)"
      style={{ height: "400vh" }}
    >
      {/* ═══ STICKY STAGE ═══ */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* ─── Layer 0: ambient violet glow ─── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
          }}
        />

        {/* ─── Layer 1: GLOBE (scroll-driven scale + position) ─── */}
        <motion.div
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
          style={
            reduced
              ? undefined
              : {
                  scale: globeScale,
                  y: globeY,
                  opacity: globeOpacity,
                  willChange: "transform, opacity",
                }
          }
        >
          <div className="relative w-[min(80vh,80vw)] aspect-square">
            {/* Soft violet glow behind the globe */}
            <div
              className="absolute inset-0 -z-10 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.25) 0%, transparent 70%)",
              }}
            />
            <Globe
              className="w-full h-full"
              dark={1}
              baseColor={[0.082, 0.063, 0.165]}
              glowColor={[0.545, 0.361, 0.965]}
              markerColor={[0.655, 0.545, 0.98]}
              arcColor={[0.655, 0.545, 0.98]}
              markers={markers}
              speed={0.003}
              mapBrightness={4}
              diffuse={1.2}
            />
          </div>
        </motion.div>

        {/* ─── Layer 2: HEADING (top of screen) ─── */}
        <motion.div
          className="absolute inset-x-0 top-[8%] md:top-[10%] z-10 px-6 md:px-12 text-center pointer-events-none"
          style={
            reduced
              ? undefined
              : {
                  opacity: headingOpacity,
                  y: headingY,
                }
          }
        >
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] md:text-xs tracking-[0.3em] text-(--accent-glow) uppercase mb-4 drop-shadow-[0_0_16px_rgba(139,92,246,0.6)]">
              {t("eyebrow")}
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white mb-4 drop-shadow-[0_4px_32px_rgba(0,0,0,0.8)]">
              {t("title")}{" "}
              <GradientText as="span" className="bg-transparent dark:bg-transparent">
                <em className="font-fraunces">{t("titleEm")}</em>
              </GradientText>
            </h2>
          </div>
        </motion.div>

        {/* ─── Layer 3: 3 CARDS HORIZONTAL ─── */}
        <div className="absolute inset-x-0 top-[35%] md:top-[38%] z-10 px-6 md:px-12 pointer-events-none">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-stretch">
              {cards.map((card, i) => (
                <motion.div
  key={i}
  style={
    reduced
      ? undefined
      : {
          opacity: card.opacity,
          y: card.y,
        }
  }
  className="pointer-events-auto h-full"
>
                 <Card
  className="bg-(--surface)/70 border backdrop-blur-xl rounded-3xl hover:scale-[1.02] transition-all duration-500 h-full"
  style={{
    borderColor: `rgba(${card.glowRgb}, 0.4)`,
    boxShadow: `0 0 60px rgba(${card.glowRgb}, 0.18), inset 0 0 20px rgba(${card.glowRgb}, 0.05)`,
  }}
>
                    <CardContent className="p-5 md:p-6 flex flex-col gap-4 h-full">
                      <div
  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
  style={{
    background: `rgba(${card.glowRgb}, 0.18)`,
    boxShadow: `0 0 30px rgba(${card.glowRgb}, 0.4), inset 0 0 12px rgba(${card.glowRgb}, 0.15)`,
  }}
>
                        <card.icon
                          size={22}
                          style={{ color: card.color }}
                        />
                      </div>
                      <div>
                        <h3
                          className="text-white font-semibold text-base md:text-lg mb-2 leading-tight"
                          style={{
                            textShadow: `0 0 20px rgba(${card.glowRgb}, 0.3)`,
                          }}
                        >
                          {card.title}
                        </h3>
                        <p className="text-(--text-muted) text-xs md:text-sm leading-relaxed">
                          {card.desc}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <motion.div
              style={reduced ? undefined : { opacity: card3Opacity, y: card3Y }}
              className="pointer-events-auto mt-6 text-center"
            >
              <Link
                href="/security"
                className="text-sm text-(--accent-glow) hover:text-(--accent-warm) transition-colors duration-200"
              >
                {t("cta")}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}