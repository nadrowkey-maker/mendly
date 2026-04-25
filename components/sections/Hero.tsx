"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { AnimatedShaderBg } from "@/components/ui/AnimatedShaderBg";
import VaporizeTextCycle, { Tag } from "@/components/vapour-text-effect";
import { PremiumButton } from "@/components/ui/PremiumButton";

const AGENT_PILLS = [
  { label: "CEO · Strategy", color: "#8B5CF6", side: "left", top: "18%" },
  { label: "CTO · Architecture", color: "#06B6D4", side: "right", top: "22%" },
  { label: "CMO · Growth", color: "#F0ABFC", side: "right", top: "62%" },
  { label: "CFO · Finance", color: "#FBBF24", side: "left", top: "65%" },
] as const;

export function Hero() {
  const t = useTranslations("hero");
  const sectionRef = useRef<HTMLElement>(null);
  // ✅ OPTIMIZATION 1: only render shader when section is in view
  const isInView = useInView(sectionRef, { margin: "200px 0px" });
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 md:px-12"
    >
      {/* ─── Layer 0: WebGL aurora shader base (the only WebGL layer) ─── */}
      {/* ✅ DigitalPetalsShader removed — was the main GPU killer */}
      {isInView && <AnimatedShaderBg />}

      {/* ─── Layer 1: Static SVG aurora (replaces 3 huge blurred motion.divs) ─── */}
      {/* ✅ OPTIMIZATION 2: replaced 4 blur-[110px+] divs with a single SVG.
          SVG gradients are GPU-cheap and visually equivalent. */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1920 1080"
        >
          <defs>
            <radialGradient id="aurora-violet" cx="20%" cy="30%" r="50%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.35)" />
              <stop offset="60%" stopColor="rgba(139, 92, 246, 0.08)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </radialGradient>
            <radialGradient id="aurora-cyan" cx="80%" cy="25%" r="45%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.22)" />
              <stop offset="60%" stopColor="rgba(6, 182, 212, 0.05)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
            </radialGradient>
            <radialGradient id="aurora-fuchsia" cx="50%" cy="80%" r="40%">
              <stop offset="0%" stopColor="rgba(240, 171, 252, 0.18)" />
              <stop offset="60%" stopColor="rgba(240, 171, 252, 0.04)" />
              <stop offset="100%" stopColor="rgba(240, 171, 252, 0)" />
            </radialGradient>
          </defs>
          <rect width="1920" height="1080" fill="url(#aurora-violet)" />
          <rect width="1920" height="1080" fill="url(#aurora-cyan)" />
          <rect width="1920" height="1080" fill="url(#aurora-fuchsia)" />
        </svg>
      </div>

      {/* ─── Layer 2: Subtle breathing animation (single transform, GPU-friendly) ─── */}
      {/* ✅ OPTIMIZATION 3: one cheap CSS scale animation instead of 3 motion.div positions */}
      {!reduced && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.85, 1, 0.85],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
            willChange: "transform, opacity",
          }}
        />
      )}

      {/* ─── Layer 3: Grid overlay (cheap, static) ─── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 85% 65% at 50% 40%, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 65% at 50% 40%, black 20%, transparent 100%)",
        }}
      />

      {/* ─── Layer 4: Noise texture (cheap SVG) ─── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.88' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ─── Layer 5: Radial vignette ─── */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_90%_80%_at_50%_40%,transparent_40%,rgba(5,3,14,0.65)_100%)]" />

      {/* ─── Floating agent pills (desktop decorative) ─── */}
      {/* ✅ OPTIMIZATION 4: only mount pills on xl screens (where they show) */}
      <div className="absolute inset-0 pointer-events-none hidden xl:block">
        {AGENT_PILLS.map(({ label, color, side, top }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
            animate={
              reduced
                ? { opacity: 1, x: 0 }
                : { opacity: 1, x: 0, y: [0, -9, 0] }
            }
            transition={{
              opacity: { duration: 0.7, delay: 1.2 + i * 0.2 },
              x: { duration: 0.7, delay: 1.2 + i * 0.2 },
              y: reduced
                ? { duration: 0 }
                : {
                    duration: 4 + i * 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5,
                  },
            }}
            className="absolute flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--surface)/75 backdrop-blur-md border border-(--border)"
            style={{ [side]: "4%", top, willChange: "transform" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: color }}
            />
            <span className="text-[10px] font-mono text-(--text-dim)">
              {label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* ─── Main content ─── */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-10 rounded-full border border-(--border-strong) bg-(--surface)/55 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--accent-glow) opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-(--accent-primary)" />
          </span>
          <span className="text-[10px] md:text-xs font-mono tracking-[0.2em] text-(--text-muted)">
            {t("eyebrow")}
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold leading-[0.93] tracking-[-0.04em] text-(--text-primary) mb-4"
        >
          {t("title")}
        </motion.h1>

        {/* Subtitle — Fraunces italic / VaporizeTextCycle on desktop only */}
        {/* ✅ OPTIMIZATION 5: VaporizeTextCycle only mounts when isInView */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <p
            className={[
              "text-3xl sm:text-4xl italic font-fraunces",
              "bg-linear-to-r from-(--accent-glow) via-(--accent-warm) to-(--accent-hot)",
              "bg-clip-text text-transparent leading-[1.15] tracking-[-0.02em]",
              reduced ? "" : "md:hidden",
            ].join(" ")}
          >
            {t("titleEm")}
          </p>
          {!reduced && isInView && (
            <div className="hidden md:block h-24 w-full">
              <VaporizeTextCycle
                texts={[t("titleEm")]}
                font={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "54px",
                  fontWeight: 400,
                }}
                color="rgb(167, 139, 250)"
                spread={4}
                density={5}
                animation={{
                  vaporizeDuration: 2.5,
                  fadeInDuration: 1.2,
                  waitDuration: 3,
                }}
                direction="left-to-right"
                alignment="center"
                tag={Tag.P}
              />
            </div>
          )}
        </motion.div>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-(--text-muted) max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          {t("sub")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <PremiumButton
            variant="primary"
            size="md"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            }
          >
            {t("ctaPrimary")}
          </PremiumButton>
          <PremiumButton
            variant="secondary"
            size="md"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            }
          >
            {t("ctaSecondary")}
          </PremiumButton>
        </motion.div>

        {/* Trust strip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-10 text-xs font-mono tracking-widest text-(--text-dim) uppercase"
        >
          {t("trust")}
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-mono tracking-[0.3em] text-(--text-dim)">
          SCROLL
        </span>
        <motion.div
          animate={reduced ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-(--border-strong) flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 rounded-full bg-(--accent-glow)" />
        </motion.div>
      </motion.div>
    </section>
  );
}