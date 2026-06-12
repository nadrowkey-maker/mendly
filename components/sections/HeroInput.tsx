"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useAuth } from "@/lib/supabase/auth-context";
import { HeroDebateDemo } from "@/components/sections/HeroDebateDemo";

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroInput() {
  const t = useTranslations("hero");
  const router = useRouter();
  const { user } = useAuth();
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Fast, deep zoom into the conversation, then the screen turns black.
  const scale = useTransform(scrollYProgress, [0, 0.62], [1, 6]);
  const contentOpacity = useTransform(scrollYProgress, [0.32, 0.55], [1, 0]);
  const black = useTransform(scrollYProgress, [0.42, 0.72], [0, 1]);

  const start = () => router.push(user ? "/dashboard/new" : "/signup");

  const fade = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease },
  });

  const content = (
    <div className="w-full max-w-3xl mx-auto text-center">
      <motion.p {...fade(0)} className="mb-4 text-[15px] font-semibold tracking-tight" style={{ color: "#0071e3" }}>
        {t("eyebrow")}
      </motion.p>

      <motion.h1
        {...fade(0.06)}
        className="font-semibold tracking-[-0.03em]"
        style={{ color: "#1d1d1f", fontSize: "clamp(40px, 6.4vw, 66px)", lineHeight: 1.05 }}
      >
        <span className="block">{t("titleLine1")}</span>
        <span className="block">{t("titleLine2")}</span>
      </motion.h1>

      <motion.p
        {...fade(0.16)}
        className="mt-5 mx-auto max-w-xl"
        style={{ color: "#6e6e73", fontSize: "clamp(17px, 2vw, 20px)", lineHeight: 1.4 }}
      >
        {t("sub")}
      </motion.p>

      <motion.div {...fade(0.24)} className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <button onClick={start} className="btn-apple">
          {t("ctaPrimary")}
        </button>
        <button
          onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
          className="link-apple cursor-pointer"
        >
          {t("ctaSecondary")} ›
        </button>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.34, ease }}
        className="max-w-sm mx-auto mt-9"
      >
        <HeroDebateDemo />
      </motion.div>
    </div>
  );

  // Reduced motion: a plain, calm hero (no scroll-zoom).
  if (reduced) {
    return (
      <section className="relative px-6 pt-32 pb-24" style={{ background: "#fff" }}>
        {content}
      </section>
    );
  }

  return (
    <section ref={ref} className="relative" style={{ height: "190vh", background: "#fff" }}>
      <div
        className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-start px-6 pt-24 md:pt-28"
        style={{ background: "#fff" }}
      >
        <motion.div style={{ scale, opacity: contentOpacity, transformOrigin: "center 74%" }} className="w-full">
          {content}
        </motion.div>
        <motion.div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: black }} aria-hidden />
      </div>
    </section>
  );
}
