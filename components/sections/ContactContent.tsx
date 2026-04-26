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

export function ContactContent() {
  const t = useTranslations("contact");
  const router = useRouter();

  const cards = [
    {
      icon: t("card1Icon"),
      title: t("card1Title"),
      email: t("card1Email"),
      note: t("card1Note"),
      href: `mailto:${t("card1Email")}`,
      extra: null,
    },
    {
      icon: t("card2Icon"),
      title: t("card2Title"),
      email: t("card2Email"),
      note: t("card2Note"),
      href: `mailto:${t("card2Email")}`,
      extra: { label: "LinkedIn →", href: "#linkedin" },
    },
    {
      icon: t("card3Icon"),
      title: t("card3Title"),
      email: t("card3Email"),
      note: t("card3Note"),
      href: `mailto:${t("card3Email")}`,
      extra: null,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-20 md:py-28">
      {/* Hero */}
      <motion.div {...fadeUp()} className="mb-16 md:mb-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          <GradientText as="span" className="bg-transparent dark:bg-transparent font-fraunces italic">
            {t("title")}
          </GradientText>
        </h1>
        <p className="text-lg md:text-xl text-(--text-muted)">{t("subtitle")}</p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            {...fadeUp(i * 0.1)}
            className="rounded-3xl border border-(--border) bg-(--surface)/50 p-7 flex flex-col gap-4 hover:border-(--accent-primary)/40 transition-colors duration-300"
            style={{ boxShadow: "0 0 40px rgba(139,92,246,0.07)" }}
          >
            <span className="text-5xl leading-none">{card.icon}</span>
            <div>
              <p className="text-sm text-(--text-dim) font-mono uppercase tracking-wider mb-2">
                {card.title}
              </p>
              <a
                href={card.href}
                className="text-base md:text-lg font-semibold text-(--accent-glow) hover:text-(--accent-warm) transition-colors duration-200 break-all"
              >
                {card.email}
              </a>
            </div>
            <p className="text-sm text-(--text-dim) leading-relaxed mt-auto">{card.note}</p>
            {card.extra && (
              <a
                href={card.extra.href}
                className="text-sm text-(--accent-hot) hover:underline self-start"
              >
                {card.extra.label}
              </a>
            )}
          </motion.div>
        ))}
      </div>

      {/* Closing */}
      <motion.div {...fadeUp(0.3)} className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {t("closingTitle")}
        </h2>
        <p className="text-(--text-muted) mb-10 max-w-md mx-auto leading-relaxed">
          {t("closingBody")}
        </p>
        <PremiumButton variant="primary" size="lg" onClick={() => router.push("/waitlist")}>
          {t("cta")}
        </PremiumButton>
      </motion.div>
    </div>
  );
}
