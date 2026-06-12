// @deprecated â€” replaced by HeroInput.tsx (Phase 1 redesign)
"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { AIAura } from "@/components/ui/AIAura";

const ease = [0.25, 1, 0.5, 1] as const;

export function Hero() {
  const t = useTranslations("hero");
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#080808]">
      {/* â”€â”€ Apple Intelligence Aura Ring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AIAura size={860} speed={7} opacity={0.9} />
      </div>

      {/* â”€â”€ Background deepening vignette â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.55) 55%, #000 85%)",
        }}
      />

      {/* â”€â”€ Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="relative z-10 max-w-5xl mx-auto text-center px-6 md:px-12 pb-32 mt-20">

        {/* Eyebrow */}
        <motion.p
          className="text-[13px] font-medium tracking-[0.18em] text-[#86868b] uppercase mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          {t("eyebrow")}
        </motion.p>

        {/* Main headline â€” Apple product page scale */}
        <motion.h1
          className="font-bold leading-[1.0] tracking-[-0.035em] text-white mb-7"
          style={{ fontSize: "clamp(56px, 9vw, 108px)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease }}
        >
          <span className="block text-white">{t("titleLine1")}</span>
          <span className="block ai-gradient-text">{t("titleLine2")}</span>
        </motion.h1>

        {/* Apple body â€” 21px, generous grey */}
        <motion.p
          className="text-xl md:text-2xl text-[#86868b] max-w-2xl mx-auto mb-14 leading-[1.47] font-normal"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22, ease }}
        >
          {t("sub")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.34, ease }}
        >
          {/* Primary â€” Apple-style white pill */}
          <button
            onClick={() => router.push("/signup")}
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white text-black text-[15px] font-semibold tracking-tight hover:bg-white/90 transition-all duration-200 hover:-translate-y-px cursor-pointer"
          >
            {t("ctaPrimary")}
          </button>

          {/* Secondary â€” ghost pill */}
          <button
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-transparent text-white text-[15px] font-semibold tracking-tight border border-[rgba(255,255,255,0.20)] hover:border-[rgba(255,255,255,0.35)] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200 cursor-pointer"
          >
            {t("ctaSecondary")}
          </button>
        </motion.div>
      </div>

      {/* Scroll caret */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="w-5 h-8 rounded-full border border-[rgba(255,255,255,0.14)] flex justify-center pt-1.5">
          <div
            className="scroll-dot-bounce w-0.5 h-1.5 rounded-full"
            style={{ background: "linear-gradient(to bottom, #8B5CF6, #06B6D4)" }}
          />
        </div>
      </motion.div>

      {/* Bottom fade to black */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[#080808] to-transparent pointer-events-none z-10" />
    </section>
  );
}


