"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { useRouter } from "@/i18n/routing";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.7, delay, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
});

export function SecurityContent() {
  const t = useTranslations("security");
  const router = useRouter();

  const pledges = [
    { icon: t("p1Icon"), title: t("p1Title"), body: t("p1Body") },
    { icon: t("p2Icon"), title: t("p2Title"), body: t("p2Body") },
    { icon: t("p3Icon"), title: t("p3Title"), body: t("p3Body") },
    { icon: t("p4Icon"), title: t("p4Title"), body: t("p4Body") },
    { icon: t("p5Icon"), title: t("p5Title"), body: t("p5Body") },
    { icon: t("p6Icon"), title: t("p6Title"), body: t("p6Body") },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-20 md:py-28">
      {/* Hero */}
      <motion.div {...fadeUp()} className="mb-6 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          {t("title")}
        </h1>
        <p className="text-lg md:text-xl font-fraunces italic">
          <GradientText as="span" className="bg-transparent dark:bg-transparent">
            {t("subtitle")}
          </GradientText>
        </p>
      </motion.div>

      {/* Intro */}
      <motion.div {...fadeUp(0.1)} className="mb-16 text-center max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-white mb-3">{t("introTitle")}</h2>
        <p className="text-(--text-muted) leading-relaxed">{t("introBody")}</p>
      </motion.div>

      {/* Pledge cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20">
        {pledges.map((pledge, i) => (
          <motion.div
            key={i}
            {...fadeUp(i * 0.08)}
            className="rounded-2xl border border-(--border) bg-(--surface)/50 p-6 flex gap-4 hover:border-(--accent-primary)/40 transition-colors duration-300"
            style={{ boxShadow: "0 0 30px rgba(139,92,246,0.06)" }}
          >
            <span className="text-3xl leading-none shrink-0 mt-1">{pledge.icon}</span>
            <div>
              <h3 className="text-white font-semibold mb-2 text-sm md:text-base">{pledge.title}</h3>
              <p className="text-(--text-muted) text-sm leading-relaxed">{pledge.body}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Vulnerability disclosure */}
      <motion.div
        {...fadeUp(0.2)}
        className="mb-16 rounded-2xl border border-(--accent-hot)/20 bg-(--surface)/30 p-8"
        style={{ boxShadow: "0 0 40px rgba(6,182,212,0.06)" }}
      >
        <h2 className="text-xl font-semibold text-white mb-3">{t("vulnTitle")}</h2>
        <p className="text-(--text-muted) leading-relaxed">{t("vulnBody")}</p>
      </motion.div>

      {/* CTA */}
      <motion.div {...fadeUp(0.3)} className="text-center">
        <h2 className="text-2xl font-bold text-white mb-8">{t("closingTitle")}</h2>
        <PremiumButton variant="primary" size="lg" onClick={() => router.push("/contact")}>
          {t("cta")}
        </PremiumButton>
      </motion.div>
    </div>
  );
}
