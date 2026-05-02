"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { PremiumButton } from "@/components/ui/PremiumButton";

const AGENT_PILLS = [
  { label: "CEO · Strategy", color: "#8B5CF6", side: "left", top: "18%", delay: 0.8, floatDuration: "4s", floatDelay: "0s" },
  { label: "CTO · Architecture", color: "#06B6D4", side: "right", top: "22%", delay: 1.1, floatDuration: "4.8s", floatDelay: "0.8s" },
  { label: "CMO · Growth", color: "#F0ABFC", side: "right", top: "62%", delay: 1.4, floatDuration: "5.2s", floatDelay: "1.6s" },
  { label: "CFO · Finance", color: "#FBBF24", side: "left", top: "65%", delay: 1.2, floatDuration: "4.5s", floatDelay: "1.2s" },
] as const;

const ease = [0.25, 1, 0.5, 1] as const;

export function Hero() {
  const t = useTranslations("hero");
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 md:px-12 bg-(--bg-primary)">
      {/* ─── BG: Auroras (static — CSS opacity, no JS animation) ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
        <svg
          className="absolute inset-0 w-full h-full opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1920 1080"
          aria-hidden
        >
          <defs>
            <radialGradient id="hero-violet" cx="20%" cy="30%" r="50%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.55)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </radialGradient>
            <radialGradient id="hero-cyan" cx="80%" cy="25%" r="45%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.4)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
            </radialGradient>
            <radialGradient id="hero-fuchsia" cx="50%" cy="80%" r="40%">
              <stop offset="0%" stopColor="rgba(240, 171, 252, 0.3)" />
              <stop offset="100%" stopColor="rgba(240, 171, 252, 0)" />
            </radialGradient>
          </defs>
          <rect width="1920" height="1080" fill="url(#hero-violet)" />
          <rect width="1920" height="1080" fill="url(#hero-cyan)" />
          <rect width="1920" height="1080" fill="url(#hero-fuchsia)" />
        </svg>
      </div>

      {/* ─── BG: Grid ─── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.12] z-2"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 80% 50% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 50% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* ─── PILLS FLOTTANTES (Desktop) ─── */}
      {/* Float = CSS @keyframes (GPU, 0 JS). Entrance only = Framer Motion (plays once). */}
      <div className="absolute inset-0 pointer-events-none hidden xl:block z-5">
        {AGENT_PILLS.map(({ label, color, side, top, delay, floatDuration, floatDelay }) => (
          <div
            key={label}
            className="absolute hero-pill-float"
            style={{
              [side]: "6%",
              top,
              animationDuration: floatDuration,
              animationDelay: floatDelay,
            } as React.CSSProperties}
          >
            <motion.div
              className="flex items-center gap-3 px-4 py-2 rounded-full bg-(--surface)/90 border border-(--border-strong) shadow-2xl"
              initial={{ opacity: 0, x: side === "left" ? -24 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay, ease }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: color, boxShadow: `0 0 12px ${color}` }}
              />
              <span className="text-[11px] font-bold font-mono tracking-wider text-white/80 uppercase">
                {label}
              </span>
            </motion.div>
          </div>
        ))}
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Eyebrow */}
        <motion.div
          className="inline-flex items-center gap-3 px-5 py-2 mb-8 rounded-full border border-(--border-strong) bg-(--surface)/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-(--accent-primary)" />
          <span className="text-[10px] md:text-xs font-mono font-bold tracking-[0.3em] text-white/60 uppercase">
            {t("eyebrow")}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.85] tracking-tighter text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
        >
          {t("title")}
        </motion.h1>

        {/* Subtitle italic */}
        <motion.p
          className="font-fraunces italic text-3xl md:text-5xl lg:text-6xl mb-12 bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #A78BFA 0%, #F0ABFC 50%, #A78BFA 100%)",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease }}
        >
          {t("titleEm")}
        </motion.p>

        {/* Description */}
        <motion.p
          className="text-base md:text-xl text-white/50 max-w-2xl mx-auto mb-14 leading-relaxed font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34, ease }}
        >
          {t("sub")}
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-5 items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.46, ease }}
        >
          <PremiumButton
            variant="primary"
            size="lg"
            onClick={() => router.push("/signup")}
          >
            {t("ctaPrimary")}
          </PremiumButton>
          <PremiumButton
            variant="secondary"
            size="lg"
            onClick={() => {
              document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {t("ctaSecondary")}
          </PremiumButton>
        </motion.div>
      </div>

      {/* Bottom Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,rgba(5,3,14,0.8),transparent_50%)] z-3" />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <span className="text-[9px] font-mono tracking-[0.4em] text-white/30 uppercase font-bold">
          Scroll to explore
        </span>
        <div className="w-6 h-10 rounded-full border-2 border-white/10 flex justify-center p-1.5">
          {/* CSS animation = GPU, no JS thread */}
          <div
            className="scroll-dot-bounce w-1 h-2 rounded-full bg-(--accent-glow)"
            style={{ animationDuration: "1.5s" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
