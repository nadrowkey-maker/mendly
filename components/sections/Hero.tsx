"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AnimatedShaderBg } from "@/components/ui/AnimatedShaderBg";
import VaporizeTextCycle, { Tag } from "@/components/vapour-text-effect";
import { LiquidButton } from "@/components/liquid-glass-button";

export function Hero() {
  const t = useTranslations("hero");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 md:px-12">
      {/* WebGL2 aurora — Mendly palette, mouse-reactive */}
      <AnimatedShaderBg />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)",
        }}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.88' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/50 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-glow)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-primary)]" />
          </span>
          <span className="text-[10px] md:text-xs font-mono tracking-[0.2em] text-[var(--text-muted)]">
            {t("eyebrow")}
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--text-primary)] mb-4"
        >
          {t("title")}
        </motion.h1>

        {/* "Not another chatbot." — vapour canvas on md+, static italic on mobile / reduced-motion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <p
            className={[
              "text-3xl sm:text-4xl italic font-[family-name:var(--font-fraunces)]",
              "bg-gradient-to-r from-[var(--accent-glow)] via-[var(--accent-warm)] to-[var(--accent-hot)]",
              "bg-clip-text text-transparent leading-[1.1] tracking-[-0.03em]",
              reducedMotion ? "" : "md:hidden",
            ].join(" ")}
          >
            {t("titleEm")}
          </p>

          {!reducedMotion && (
            <div className="hidden md:block h-[90px] w-full">
              <VaporizeTextCycle
                texts={[t("titleEm")]}
                font={{ fontFamily: "Fraunces, serif", fontSize: "52px", fontWeight: 400 }}
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

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-12 leading-relaxed"
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
          {/* Primary — violet liquid glass */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_60px_rgba(139,92,246,0.7)] transition-shadow duration-500 pointer-events-none" />
            <LiquidButton
              className="rounded-full bg-[var(--accent-primary)]/80 text-white font-semibold text-sm md:text-base gap-2"
            >
              {t("ctaPrimary")}
              <svg
                className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </LiquidButton>
          </div>

          {/* Secondary — ghost liquid glass */}
          <LiquidButton
            className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/30 text-[var(--text-primary)] font-semibold text-sm md:text-base gap-2"
          >
            {t("ctaSecondary")}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </LiquidButton>
        </motion.div>

        {/* Trust strip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-10 text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase"
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
        <span className="text-[10px] font-mono tracking-[0.3em] text-[var(--text-dim)]">
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-[var(--border-strong)] flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 rounded-full bg-[var(--accent-glow)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
