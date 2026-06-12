"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/lib/supabase/auth-context";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppleSection } from "./AppleSection";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

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
  onClick?: () => void;
}

export function PricingSection() {
  const t = useTranslations("pricing");
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const { user } = useAuth();

  const handleCta = (plan: "free" | "starter" | "pro") => {
    if (user) router.push(plan === "free" ? "/dashboard" : "/upgrade");
    else router.push(plan === "free" ? "/signup" : `/signup?plan=${plan}`);
  };

  const tiers: Tier[] = [
    {
      name: t("tier1Name"), price: t("tier1Price"), period: t("tier1Period"), tagline: t("tier1Tagline"),
      features: [t("tier1Feature1"), t("tier1Feature2"), t("tier1Feature3"), t("tier1Feature4")],
      cta: t("tier1Cta"), popular: false, onClick: () => handleCta("free"),
    },
    {
      name: t("tier2Name"), price: t("tier2Price"), priceYearly: t("tier2PriceYearly"),
      period: t("tier2Period"), periodYearly: t("tier2PeriodYearly"), tagline: t("tier2Tagline"),
      features: [t("tier2Feature1"), t("tier2Feature2"), t("tier2Feature3"), t("tier2Feature4"), t("tier2Feature5"), t("tier2Feature6")],
      cta: t("tier2Cta"), popular: true, badge: t("tier2Badge"), onClick: () => handleCta("starter"),
    },
    {
      name: t("tier3Name"), price: t("tier3Price"), priceYearly: t("tier3PriceYearly"),
      period: t("tier3Period"), periodYearly: t("tier3PeriodYearly"), tagline: t("tier3Tagline"),
      features: [t("tier3Feature1"), t("tier3Feature2"), t("tier3Feature3"), t("tier3Feature4"), t("tier3Feature5"), t("tier3Feature6")],
      cta: t("tier3Cta"), popular: false, onClick: () => handleCta("pro"),
    },
  ];

  return (
    <AppleSection id="pricing" dark>
      <Reveal>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} accent={t("titleEm")} sub={t("sub")} />
      </Reveal>

      <div className="flex items-center justify-center mt-10 mb-14">
        <div className="relative inline-flex items-center rounded-full border border-(--apple-border-2) p-1">
          {(["monthly", "yearly"] as const).map((mode) => {
            const isMode = (mode === "yearly") === isYearly;
            return (
              <button
                key={mode}
                onClick={() => setIsYearly(mode === "yearly")}
                className="relative px-5 py-2 rounded-full text-sm font-medium cursor-pointer"
              >
                {isMode && (
                  <motion.div
                    layoutId="billing-pill"
                    className="absolute inset-0 rounded-full bg-(--apple-elev)"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className={cn("relative z-10 inline-flex items-center gap-2", isMode ? "text-(--apple-text)" : "text-(--apple-text-2)")}>
                  {mode === "monthly" ? t("billingMonthly") : t("billingYearly")}
                  {mode === "yearly" && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full font-semibold text-white bg-(--apple-accent)">
                      {t("yearlyBadge")}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        {tiers.map((tier) => {
          const price = isYearly && tier.priceYearly ? tier.priceYearly : tier.price;
          const period = isYearly && tier.periodYearly ? tier.periodYearly : tier.period;
          return (
            <div
              key={tier.name}
              className={cn("card-apple p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]", tier.popular ? "lg:scale-[1.03]" : "")}
              style={tier.popular ? { border: "1px solid rgba(0,113,227,0.5)" } : { border: "1px solid var(--apple-border)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="text-[13px] font-semibold tracking-wide text-(--apple-text-2) uppercase">{tier.name}</p>
                {tier.badge && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold text-white bg-(--apple-accent)">{tier.badge}</span>
                )}
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-4xl font-semibold tracking-tight">{price}</span>
                <span className="pb-1.5 text-sm text-(--apple-text-2)">{period}</span>
              </div>
              <p className="mt-2 text-sm text-(--apple-text-2)">{tier.tagline}</p>
              <div className="h-px my-6 bg-(--apple-border)" />
              <ul className="space-y-3 mb-7">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-(--apple-text)">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-(--apple-accent)" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={tier.onClick} className={cn("w-full", tier.popular ? "btn-apple" : "btn-apple-tonal")}>
                {tier.cta}
              </button>
            </div>
          );
        })}
      </div>
    </AppleSection>
  );
}
