"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { GrainGradient } from "@/components/ui/GrainGradient";
import { IntakeCard } from "@/components/home/IntakeCard";

/**
 * Les trois étapes de départ.
 *
 * Le numéro est gros et fin, le texte petit et gris : l'inverse du réflexe.
 * C'est la numérotation qui doit se voir de loin, parce qu'elle est le seul
 * argument de cette section — il n'y a que trois étapes, et c'est ça qu'on
 * vend. Le texte, lui, se lit de près ou pas du tout.
 */
export function GetStarted() {
  const t = useTranslations("home.start");
  const steps = [t("step1"), t("step2"), t("step3")];

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8">
      <div className="max-w-lg">
        <h2 className="display text-[28px] text-(--ink) md:text-[38px]">{t("title")}</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-(--ink-soft)">{t("sub")}</p>
      </div>

      <div className="mt-12 grid gap-10 md:mt-14 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-16">
        <ol className="border-t border-(--paper-line)">
          {steps.map((step, i) => (
            <li key={step} className="border-b border-(--paper-line) py-6">
              <span className="display block text-[26px] text-(--ink)/25">{i + 1}.</span>
              <p className="mt-2 text-[13.5px] leading-relaxed text-(--ink-soft)">{step}</p>
            </li>
          ))}
        </ol>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex min-h-[380px] items-center overflow-hidden rounded-3xl p-6 md:min-h-[440px] md:p-10"
        >
          <GrainGradient
            colorway="ash"
            seed={58}
            grain={0.5}
            className="absolute inset-0 size-full"
          />
          <div className="relative mx-auto w-full max-w-sm">
            <IntakeCard />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
