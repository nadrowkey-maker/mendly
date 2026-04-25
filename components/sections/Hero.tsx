"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { AnimatedShaderBg } from "@/components/ui/AnimatedShaderBg";
import VaporizeTextCycle, { Tag } from "@/components/vapour-text-effect";
import { PremiumButton } from "@/components/ui/PremiumButton";

// Configuration des pilules décoratives
const AGENT_PILLS = [
  { label: "CEO · Strategy", color: "#8B5CF6", side: "left", top: "18%" },
  { label: "CTO · Architecture", color: "#06B6D4", side: "right", top: "22%" },
  { label: "CMO · Growth", color: "#F0ABFC", side: "right", top: "62%" },
  { label: "CFO · Finance", color: "#FBBF24", side: "left", top: "65%" },
] as const;

export function Hero() {
  const t = useTranslations("hero");
  const sectionRef = useRef<HTMLElement>(null);
  
  const isInView = useInView(sectionRef, { margin: "100px 0px" });
  const reduced = useReducedMotion() ?? false;

  // Stagger VaporizeTextCycle 250ms after mount so AnimatedShaderBg's WebGL loop
  // stabilizes before the canvas particle loop starts — prevents competing RAF jank.
  const [showVaporize, setShowVaporize] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShowVaporize(true), 250);
    return () => clearTimeout(id);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 md:px-12 bg-(--bg-primary)"
    >
      {/* ─── LAYER 0: SHADER WEBGL (Aurora) ─── */}
      {isInView && (
        <div className="absolute inset-0 z-0 opacity-60">
          <AnimatedShaderBg />
        </div>
      )}

      {/* ─── LAYER 1: SVG AURORAS (Performances max) ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
        <svg
          className="absolute inset-0 w-full h-full opacity-40"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1920 1080"
        >
          <defs>
            <radialGradient id="hero-violet" cx="20%" cy="30%" r="50%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </radialGradient>
            <radialGradient id="hero-cyan" cx="80%" cy="25%" r="45%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
            </radialGradient>
          </defs>
          <rect width="1920" height="1080" fill="url(#hero-violet)" />
          <rect width="1920" height="1080" fill="url(#hero-cyan)" />
        </svg>
      </div>

      {/* ─── LAYER 2: GRID & NOISE ─── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.12] z-[2]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 80% 50% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* ─── FLOATING PILLS (Desktop) ─── */}
      <div className="absolute inset-0 pointer-events-none hidden xl:block z-[5]">
        {AGENT_PILLS.map(({ label, color, side, top }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: side === "left" ? -30 : 30 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              y: reduced ? 0 : [0, -12, 0] 
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.5 + i * 0.15 },
              x: { duration: 0.8, delay: 0.5 + i * 0.15 },
              y: {
                duration: 5 + i,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            // On utilise une opacité élevée au lieu du backdrop-blur pour la performance
            className="absolute flex items-center gap-3 px-4 py-2 rounded-full bg-(--surface)/90 border border-(--border-strong) shadow-2xl"
            style={{ [side]: "6%", top }}
          >
            <span
              className="w-2 h-2 rounded-full shadow-[0_0_12px_var(--pill-color)]"
              style={{ background: color, "--pill-color": color } as any}
            />
            <span className="text-[11px] font-bold font-mono tracking-wider text-white/80 uppercase">
              {label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 px-5 py-2 mb-8 rounded-full border border-(--border-strong) bg-(--surface)/80"
        >
          <span className="relative flex h-2.5 w-2.5">
            <motion.span 
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inline-flex h-full w-full rounded-full bg-(--accent-primary)" 
            />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-(--accent-primary)" />
          </span>
          <span className="text-[10px] md:text-xs font-mono font-bold tracking-[0.3em] text-white/60 uppercase">
            {t("eyebrow")}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.85] tracking-tighter text-white mb-6"
        >
          {t("title")}
        </motion.h1>

        {/* Vapour Text (Subtitle) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mb-12"
        >
          {/* Version mobile : texte fixe simple pour éviter le lag sur téléphone */}
          <p className="md:hidden text-3xl italic font-fraunces text-(--accent-glow)">
            {t("titleEm")}
          </p>
          
          {/* Version Desktop : L'effet de poussière magique */}
          {showVaporize && !reduced && (
            <div className="hidden md:block h-32 w-full">
              <VaporizeTextCycle
                texts={[t("titleEm")]}
                font={{
                  fontFamily: "Fraunces, serif",
                  fontSize: "64px",
                  fontWeight: 400,
                }}
                color="rgb(167, 139, 250)"
                spread={3}
                density={6}
                animation={{
                  vaporizeDuration: 2.5,
                  fadeInDuration: 1.5,
                  waitDuration: 4,
                }}
                alignment="center"
                tag={Tag.P}
              />
            </div>
          )}
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-base md:text-xl text-white/50 max-w-2xl mx-auto mb-14 leading-relaxed font-medium"
        >
          {t("sub")}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-5 items-center justify-center"
        >
          <PremiumButton variant="primary" size="lg">
            {t("ctaPrimary")}
          </PremiumButton>
          <PremiumButton variant="secondary" size="lg">
            {t("ctaSecondary")}
          </PremiumButton>
        </motion.div>
      </div>

      {/* Bottom Vignette & Scroll */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,rgba(5,3,14,0.8),transparent_50%)] z-[3]" />
      
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
      >
        <span className="text-[9px] font-mono tracking-[0.4em] text-white/30 uppercase font-bold">
          Scroll to explore
        </span>
        <div className="w-6 h-10 rounded-full border-2 border-white/10 flex justify-center p-1.5">
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 rounded-full bg-(--accent-glow)" 
          />
        </div>
      </motion.div>
    </section>
  );
}