"use client";

import { useTranslations } from "next-intl";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { AnimatedShaderBg } from "@/components/ui/AnimatedShaderBg";
import VaporizeTextCycle, { Tag } from "@/components/vapour-text-effect";
import { LiquidButton } from "@/components/liquid-glass-button";

const AGENT_PILLS = [
  { label: "CEO · Strategy", color: "#8B5CF6", side: "left", top: "18%" },
  { label: "CTO · Architecture", color: "#06B6D4", side: "right", top: "22%" },
  { label: "CMO · Growth", color: "#F0ABFC", side: "right", top: "62%" },
  { label: "CFO · Finance", color: "#FBBF24", side: "left", top: "65%" },
] as const;

export function Hero() {
  const t = useTranslations("hero");
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "200px 0px" });
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 md:px-12"
    >
      {/* ─── Layer 0: WebGL aurora shader ─── */}
      {isInView && <AnimatedShaderBg />}

      {/* ─── Layer 1: Large animated CSS aurora blobs ─── */}
      {!reduced && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 48, -24, 0], y: [0, -36, 24, 0], scale: [1, 1.06, 0.96, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -left-40 w-[780px] h-[780px] rounded-full bg-[rgba(139,92,246,0.22)] blur-[130px]"
          />
          <motion.div
            animate={{ x: [0, -36, 18, 0], y: [0, 44, -18, 0], scale: [1, 1.09, 0.94, 1] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -right-40 w-[660px] h-[660px] rounded-full bg-[rgba(6,182,212,0.17)] blur-[110px]"
          />
          <motion.div
            animate={{ x: [0, 22, -16, 0], y: [0, -28, 12, 0], scale: [1, 1.07, 0.97, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-56 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-[rgba(240,171,252,0.14)] blur-[100px]"
          />
        </div>
      )}

      {/* ─── Layer 2: Central halo glow ─── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[420px] rounded-full bg-[rgba(139,92,246,0.10)] blur-[90px]" />
      </div>

      {/* ─── Layer 3: Grid overlay ─── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 85% 65% at 50% 40%, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 65% at 50% 40%, black 20%, transparent 100%)",
        }}
      />

      {/* ─── Layer 4: Noise ─── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.88' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ─── Layer 5: Radial edge vignette ─── */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_90%_80%_at_50%_40%,transparent_40%,rgba(5,3,14,0.65)_100%)]" />

      {/* ─── Floating agent pills (desktop decorative) ─── */}
      <div className="absolute inset-0 pointer-events-none hidden xl:block">
        {AGENT_PILLS.map(({ label, color, side, top }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0, y: [0, -9, 0] }}
            transition={{
              opacity: { duration: 0.7, delay: 1.2 + i * 0.2 },
              x: { duration: 0.7, delay: 1.2 + i * 0.2 },
              y: { duration: 4 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 },
            }}
            className="absolute flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--surface)/75 backdrop-blur-md border border-(--border)"
            style={{
              [side]: "4%",
              top,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: color }}
            />
            <span className="text-[10px] font-mono text-(--text-dim)">{label}</span>
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

        {/* Italic subtitle — Cormorant Garamond via --font-fraunces */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          {/* Mobile / reduced-motion: static gradient italic */}
          <p
            className={[
              "text-3xl sm:text-4xl italic font-[family-name:var(--font-fraunces)]",
              "bg-gradient-to-r from-(--accent-glow) via-(--accent-warm) to-(--accent-hot)",
              "bg-clip-text text-transparent leading-[1.15] tracking-[-0.02em]",
              reduced ? "" : "md:hidden",
            ].join(" ")}
          >
            {t("titleEm")}
          </p>

          {/* Desktop vapour effect */}
          {!reduced && (
            <div className="hidden md:block h-[96px] w-full">
              <VaporizeTextCycle
                texts={[t("titleEm")]}
                font={{ fontFamily: "Cormorant Garamond, serif", fontSize: "54px", fontWeight: 400 }}
                color="rgb(167, 139, 250)"
                spread={4}
                density={5}
                animation={{ vaporizeDuration: 2.5, fadeInDuration: 1.2, waitDuration: 3 }}
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
          <div className="relative group">
            <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(139,92,246,0.45)] group-hover:shadow-[0_0_70px_rgba(139,92,246,0.75)] transition-shadow duration-500 pointer-events-none" />
            <LiquidButton className="rounded-full bg-[var(--accent-primary)]/80 text-white font-semibold text-sm md:text-base gap-2">
              {t("ctaPrimary")}
              <svg className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </LiquidButton>
          </div>

          <LiquidButton className="rounded-full border border-(--border-strong) bg-(--surface)/30 text-(--text-primary) font-semibold text-sm md:text-base gap-2">
            {t("ctaSecondary")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </LiquidButton>
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
        <span className="text-[10px] font-mono tracking-[0.3em] text-(--text-dim)">SCROLL</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-(--border-strong) flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 rounded-full bg-(--accent-glow)" />
        </motion.div>
      </motion.div>
    </section>
  );
}
