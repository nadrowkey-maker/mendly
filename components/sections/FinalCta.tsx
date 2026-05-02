"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import DigitalPetalsShader from "@/components/digital-petals-shader";
import { LiquidButton } from "@/components/liquid-glass-button";

export function FinalCtaSection() {
  const t = useTranslations("finalCta");
  const router = useRouter();

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "200px 0px" });

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      className="relative scroll-mt-20 overflow-hidden py-32 md:py-52 px-6 md:px-12"
    >
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {isInView && <DigitalPetalsShader />}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_50%,transparent_15%,var(--bg-primary)_80%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-(--bg-primary) to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-(--bg-primary) to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
        >
          {t("title")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg md:text-xl text-(--text-muted) mb-12"
        >
          {t("sub")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true }}
        >
          <LiquidButton
            size="xxl"
            className="text-white font-semibold tracking-wide px-10"
            onClick={() => router.push("/signup")}
          >
            {t("cta")}
          </LiquidButton>
        </motion.div>
      </div>
    </section>
  );
}
