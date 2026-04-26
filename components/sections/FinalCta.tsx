"use client";
import { useRef } from "react"; // AJOUT
import { motion, useInView } from "framer-motion"; // AJOUT
import { useTranslations } from "next-intl";
import DigitalPetalsShader from "@/components/digital-petals-shader";
import { GradientText } from "@/components/ui/gradient-text";
import { LiquidButton } from "@/components/liquid-glass-button";

export function FinalCtaSection() {
  const t = useTranslations("finalCta");

  // SÉCURITÉ
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "200px 0px" });

  return (
    // ATTACHE LA RÉFÉRENCE ICI
    <section id="manifesto" ref={sectionRef} className="relative scroll-mt-20 overflow-hidden py-32 md:py-52 px-6 md:px-12">
      {/* CONSEIL STRATÉGIQUE : 
          On garde UNIQUEMENT DigitalPetalsShader. 
          L'empilement avec raidal-2 créait une boucle infinie d'événements "Resize".
      */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {isInView && <DigitalPetalsShader />}
      </div>

      {/* Radial vignette — Pour la lisibilité du texte */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_50%,transparent_15%,var(--bg-primary)_80%)] pointer-events-none" />

      {/* Top / bottom fades — Pour une transition douce avec les autres sections */}
      <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-(--bg-primary) to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-(--bg-primary) to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">

        {/* ── MANIFESTO BLOCK ── */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="mb-14 md:mb-20"
        >
          <p className="text-base md:text-lg text-white/60 font-fraunces italic tracking-widest mb-6 uppercase">
            {t("manifesto1")}
          </p>

          <p className="font-fraunces italic font-bold leading-[1.1] tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-white">
              {t("manifesto2")}
            </span>
            {" "}
            <GradientText as="span" className="bg-transparent dark:bg-transparent">
              {t("manifesto3")}
            </GradientText>
          </p>
        </motion.div>

        {/* Transition text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-base md:text-lg text-white/70 mb-10"
        >
          {t("transition")}
        </motion.p>

        {/* CTA block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-5"
        >
          <LiquidButton size="xxl" className="text-white font-semibold tracking-wide px-10">
            {t("cta")}
          </LiquidButton>

          <p className="text-sm text-(--text-dim) max-w-sm leading-relaxed">
            {t("sub")}
          </p>

          <p className="text-xs tracking-[0.2em] text-(--accent-glow) uppercase">
            {t("counter", { count: 247 })}
          </p>
        </motion.div>
      </div>
    </section>
  );
}