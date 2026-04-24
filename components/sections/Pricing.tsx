"use client";
import { useState, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientText } from "@/components/ui/gradient-text";
import { LiquidButton } from "@/components/liquid-glass-button";

interface Tier {
  name: string;
  price: string;
  priceYearly?: string;
  period: string;
  periodYearly?: string;
  tagline: string;
  features: string[];
  cta: string;
  popular: boolean;
  badge?: string;
}

function PricingCard({
  tier,
  index,
  reduced,
  isYearly,
}: {
  tier: Tier;
  index: number;
  reduced: boolean;
  isYearly: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty("--mx", `${((e.clientX - left) / width) * 100}%`);
    cardRef.current.style.setProperty("--my", `${((e.clientY - top) / height) * 100}%`);
  }

  function handleMouseLeave() {
    if (!cardRef.current) return;
    cardRef.current.style.removeProperty("--mx");
    cardRef.current.style.removeProperty("--my");
  }

  const displayPrice = isYearly && tier.priceYearly ? tier.priceYearly : tier.price;
  const displayPeriod = isYearly && tier.periodYearly ? tier.periodYearly : tier.period;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={tier.popular ? {} : { y: -4, scale: 1.02 }}
      transition={{ duration: 0.7, delay: reduced ? 0 : index * 0.09, ease: [0.25, 1, 0.5, 1] }}
      viewport={{ once: true, margin: "-60px" }}
      className={cn(
        "rounded-3xl border p-6 flex flex-col gap-5 relative overflow-hidden group/card cursor-pointer",
        tier.popular
          ? "bg-(--surface) border-(--accent-primary) shadow-[0_0_60px_rgba(139,92,246,0.32)] lg:scale-[1.04] z-10"
          : "bg-(--surface)/50 border-(--border) backdrop-blur-sm hover:border-(--accent-primary)/40 transition-colors duration-300"
      )}
    >
      {/* Mouse-tracking spotlight */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none",
          tier.popular
            ? "bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(139,92,246,0.18)_0%,transparent_60%)]"
            : "bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(139,92,246,0.10)_0%,transparent_55%)]"
        )}
      />

      {/* Gradient shimmer on the border for popular card */}
      {tier.popular && (
        <div className="absolute inset-0 rounded-3xl pointer-events-none [background:linear-gradient(135deg,rgba(139,92,246,0.12)_0%,transparent_40%,rgba(6,182,212,0.08)_100%)]" />
      )}

      {tier.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-(--accent-primary) text-white text-[11px] font-semibold tracking-[0.1em] whitespace-nowrap shadow-[0_0_24px_rgba(139,92,246,0.6)] z-10">
          {tier.badge}
        </div>
      )}

      {/* Name + price */}
      <div className={tier.badge ? "mt-2 relative z-10" : "relative z-10"}>
        <p className="text-[11px] font-mono font-bold tracking-[0.2em] text-(--text-dim) uppercase">{tier.name}</p>
        <div className="flex items-baseline gap-1.5 mt-2 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={displayPrice}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              className="text-3xl font-bold text-white"
            >
              {displayPrice}
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.span
              key={displayPeriod}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-(--text-dim)"
            >
              {displayPeriod}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="text-sm text-(--text-muted) mt-1">{tier.tagline}</p>
      </div>

      {/* Divider */}
      <div className={cn("h-px relative z-10", tier.popular ? "bg-(--accent-primary)/30" : "bg-(--border)")} />

      {/* Features */}
      <ul className="space-y-2.5 flex-1 relative z-10">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-(--text-muted)">
            <Check
              className={cn(
                "w-4 h-4 shrink-0 mt-0.5",
                tier.popular ? "text-(--accent-glow)" : "text-(--text-dim) group-hover/card:text-(--accent-glow) transition-colors duration-300"
              )}
            />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="relative z-10">
        <LiquidButton
          size="lg"
          className={cn("w-full font-semibold", tier.popular ? "text-white" : "text-(--text-muted)")}
        >
          {tier.cta}
        </LiquidButton>
      </div>
    </motion.div>
  );
}

export function PricingSection() {
  const t = useTranslations("pricing");
  const reduced = useReducedMotion() ?? false;
  const [isYearly, setIsYearly] = useState(false);

  const tiers: Tier[] = [
    {
      name: t("tier1Name"), price: t("tier1Price"), period: t("tier1Period"),
      tagline: t("tier1Tagline"),
      features: [t("tier1Feature1"), t("tier1Feature2"), t("tier1Feature3"), t("tier1Feature4")],
      cta: t("tier1Cta"), popular: false,
    },
    {
      name: t("tier2Name"), price: t("tier2Price"), priceYearly: t("tier2PriceYearly"),
      period: t("tier2Period"), periodYearly: t("tier2PeriodYearly"),
      tagline: t("tier2Tagline"),
      features: [t("tier2Feature1"), t("tier2Feature2"), t("tier2Feature3"), t("tier2Feature4"), t("tier2Feature5")],
      cta: t("tier2Cta"), popular: true, badge: t("tier2Badge"),
    },
    {
      name: t("tier3Name"), price: t("tier3Price"), priceYearly: t("tier3PriceYearly"),
      period: t("tier3Period"), periodYearly: t("tier3PeriodYearly"),
      tagline: t("tier3Tagline"),
      features: [t("tier3Feature1"), t("tier3Feature2"), t("tier3Feature3"), t("tier3Feature4"), t("tier3Feature5"), t("tier3Feature6")],
      cta: t("tier3Cta"), popular: false,
    },
    {
      name: t("tier4Name"), price: t("tier4Price"), priceYearly: t("tier4PriceYearly"),
      period: t("tier4Period"), periodYearly: t("tier4PeriodYearly"),
      tagline: t("tier4Tagline"),
      features: [t("tier4Feature1"), t("tier4Feature2"), t("tier4Feature3"), t("tier4Feature4"), t("tier4Feature5"), t("tier4Feature6")],
      cta: t("tier4Cta"), popular: false,
    },
  ];

  return (
    <section className="relative overflow-hidden py-24 md:py-40 px-6 md:px-12 bg-(--bg-secondary)">
      {/* Aurora ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[rgba(139,92,246,0.09)] blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[rgba(6,182,212,0.07)] blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 rounded-full bg-[rgba(240,171,252,0.06)] blur-[90px]" />
      </div>
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-(--bg-primary) to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-(--bg-primary) to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-10 md:mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-(--accent-glow) uppercase mb-6">{t("eyebrow")}</p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-6">
            {t("title")}{" "}
            <GradientText as="span" className="bg-transparent dark:bg-transparent">
              <em className="font-fraunces">{t("titleEm")}</em>
            </GradientText>
          </h2>
          <p className="text-lg md:text-xl text-(--text-muted) max-w-xl mx-auto">{t("sub")}</p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-3 mb-14"
        >
          <span className={cn("text-sm font-medium transition-colors duration-200", !isYearly ? "text-white" : "text-(--text-dim)")}>
            {t("billingMonthly")}
          </span>
          <button
            onClick={() => setIsYearly((v) => !v)}
            aria-label="Toggle billing period"
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-primary)",
              isYearly ? "bg-(--accent-primary)" : "bg-(--surface-elevated)"
            )}
          >
            <span
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300",
                isYearly ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
          <span className={cn("text-sm font-medium transition-colors duration-200", isYearly ? "text-white" : "text-(--text-dim)")}>
            {t("billingYearly")}
          </span>
          <AnimatePresence>
            {isYearly && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8, x: -4 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -4 }}
                transition={{ duration: 0.2 }}
                className="text-xs px-2.5 py-1 rounded-full bg-(--accent-primary)/20 text-(--accent-glow) border border-(--accent-primary)/30 font-medium"
              >
                {t("yearlyBadge")}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start py-6">
          {tiers.map((tier, i) => (
            <PricingCard key={tier.name} tier={tier} index={i} reduced={reduced} isYearly={isYearly} />
          ))}
        </div>

        {/* Compare link */}
        <motion.p
          initial={{ opacity: reduced ? 1 : 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-10 text-sm text-(--accent-glow) hover:text-(--accent-primary) transition-colors cursor-pointer"
        >
          {t("compareCta")}
        </motion.p>
      </div>
    </section>
  );
}
