"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { useRouter } from "@/i18n/routing";

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
};

export function ManifestoContent() {
  const t = useTranslations("manifesto");
  const router = useRouter();

  const sections = [
    { title: t("section1Title"), body: [t("section1Body1"), t("section1Body2")] },
    { title: t("section2Title"), body: [t("section2Body1"), t("section2Body2")] },
    { title: t("section3Title"), body: [t("section3Body1"), t("section3Body2")] },
    { title: t("section4Title"), body: [t("section4Body1"), t("section4Body2")] },
    { title: t("section5Title"), body: [t("section5Body")] },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-12 py-20 md:py-28">
      {/* Hero */}
      <motion.div {...fadeUp} className="mb-20">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          {t("title")}
        </h1>
        <p className="text-xl md:text-2xl font-fraunces italic">
          <GradientText as="span" className="bg-transparent dark:bg-transparent">
            {t("subtitle")}
          </GradientText>
        </p>
      </motion.div>

      {/* Sections */}
      {sections.map((section, i) => (
        <motion.div
          key={i}
          {...fadeUp}
          transition={{ duration: 0.8, delay: i * 0.05, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] }}
          className="mb-14"
        >
          {i > 0 && <hr className="border-(--border) mb-14" />}
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-5">
            {section.title}
          </h2>
          {section.body.map((paragraph, j) => (
            <p key={j} className="text-base md:text-lg text-(--text-muted) leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </motion.div>
      ))}

      {/* CTA */}
      <motion.div
        {...fadeUp}
        className="mt-20 rounded-3xl border border-(--border) bg-(--surface)/50 p-10 md:p-14 text-center"
        style={{ boxShadow: "0 0 60px rgba(139,92,246,0.1)" }}
      >
        <PremiumButton variant="primary" size="lg" onClick={() => router.push("/waitlist")}>
          {t("cta")}
        </PremiumButton>
      </motion.div>
    </div>
  );
}
