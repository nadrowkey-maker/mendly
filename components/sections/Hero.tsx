"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function Hero() {
  const t = useTranslations("hero");
  const heroRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 md:px-12"
    >
      {/* Spotlight qui suit la souris */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}% ${mousePos.y}%, rgba(139, 92, 246, 0.25), transparent 50%)`,
        }}
      />

      {/* Aurora background animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-40"
          style={{ background: "var(--accent-primary)" }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-30"
          style={{ background: "var(--accent-hot)" }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-[30%] left-[40%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20"
          style={{ background: "var(--accent-warm)" }}
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Grid background subtil */}
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

      {/* Contenu principal */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/50 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-glow)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-primary)]"></span>
          </span>
          <span className="text-[10px] md:text-xs font-mono tracking-[0.2em] text-[var(--text-muted)]">
            {t("eyebrow")}
          </span>
        </motion.div>

        {/* Titre principal */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--text-primary)] mb-4"
        >
          {t("title")}
        </motion.h1>

        {/* Sous-titre italique */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-[-0.03em] mb-10 italic"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          <span className="bg-gradient-to-r from-[var(--accent-glow)] via-[var(--accent-warm)] to-[var(--accent-hot)] bg-clip-text text-transparent">
            {t("titleEm")}
          </span>
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          {t("sub")}
        </motion.p>

        {/* Boutons CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          {/* CTA primaire avec glow pulsant */}
          <button className="group relative px-8 py-4 rounded-full bg-[var(--accent-primary)] text-white font-semibold text-sm md:text-base overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            <span className="relative z-10 flex items-center gap-2">
              {t("ctaPrimary")}
              <svg
                className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-[var(--accent-glow)] opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500" />
            <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_60px_rgba(139,92,246,0.7)] transition-shadow duration-500" />
          </button>

          {/* CTA secondaire ghost */}
          <button className="group px-8 py-4 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/30 backdrop-blur-sm text-[var(--text-primary)] font-semibold text-sm md:text-base transition-all duration-500 hover:bg-[var(--surface)]/60 hover:border-[var(--accent-glow)]">
            <span className="flex items-center gap-2">
              {t("ctaSecondary")}
              <svg
                className="w-4 h-4 transition-transform duration-500 group-hover:translate-y-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </span>
          </button>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-10 text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase"
        >
          Built on Claude · GPT-4 · Gemini
        </motion.p>
      </div>

      {/* Scroll indicator en bas */}
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