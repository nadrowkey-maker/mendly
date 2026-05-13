"use client";
import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/lib/supabase/auth-context";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.25, 1, 0.5, 1] as const;

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
  ctaOnClick?: () => void;
}

function PricingCard({ tier, index, reduced, isYearly }: { tier: Tier; index: number; reduced: boolean; isYearly: boolean }) {
  const displayPrice = isYearly && tier.priceYearly ? tier.priceYearly : tier.price;
  const displayPeriod = isYearly && tier.periodYearly ? tier.periodYearly : tier.period;

  return (
    <motion.div
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: reduced ? 0 : index * 0.08, ease }}
      viewport={{ once: true, margin: "-60px" }}
      className={cn("relative", tier.popular ? "lg:scale-[1.03] z-10" : "")}
    >
      {/* Badge */}
      {tier.badge && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap z-20"
          style={{ background: "linear-gradient(135deg,#BF5AF2,#FF375F,#0A84FF)", color: "#fff" }}
        >
          {tier.badge}
        </div>
      )}

      {/* Card */}
      {tier.popular ? (
        <div
          className="rounded-3xl p-6 flex flex-col gap-5 h-full border border-[rgba(191,90,242,0.28)] transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(191,90,242,0.12)]"
          style={{
            background: "rgba(191,90,242,0.05)",
            boxShadow: "0 0 40px rgba(191,90,242,0.08)",
          }}
        >
          <CardInner tier={tier} displayPrice={displayPrice} displayPeriod={displayPeriod} />
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 flex flex-col gap-5 h-full hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-300">
          <CardInner tier={tier} displayPrice={displayPrice} displayPeriod={displayPeriod} />
        </div>
      )}
    </motion.div>
  );
}

function CardInner({ tier, displayPrice, displayPeriod }: { tier: Tier; displayPrice: string; displayPeriod: string }) {
  return (
    <>
      {/* Name + price */}
      <div className={tier.badge ? "mt-2" : ""}>
        <p className="text-[11px] tracking-[0.2em] text-[#6E6E73] uppercase mb-3">{tier.name}</p>
        <div className="flex items-baseline gap-1.5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={displayPrice}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="text-3xl font-semibold text-white"
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
              transition={{ duration: 0.18 }}
              className="text-sm text-[#6E6E73]"
            >
              {displayPeriod}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="text-sm text-[#A1A1A6] mt-1.5">{tier.tagline}</p>
      </div>

      {/* Divider */}
      <div className={cn("h-px", tier.popular ? "bg-[rgba(191,90,242,0.20)]" : "bg-[rgba(255,255,255,0.06)]")} />

      {/* Features */}
      <ul className="space-y-2.5 flex-1">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-[#A1A1A6]">
            <Check className={cn("w-4 h-4 shrink-0 mt-0.5", tier.popular ? "text-[#BF5AF2]" : "text-[#6E6E73]")} />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={tier.ctaOnClick}
        className={cn(
          "w-full h-11 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer",
          tier.popular
            ? "text-white hover:opacity-90 active:scale-[0.99]"
            : "bg-[rgba(255,255,255,0.06)] text-white/80 hover:bg-[rgba(255,255,255,0.10)] hover:text-white active:scale-[0.99]"
        )}
        style={tier.popular ? { background: "linear-gradient(135deg,#BF5AF2,#FF375F,#0A84FF)" } : {}}
      >
        {tier.cta}
      </button>
    </>
  );
}

export function PricingSection() {
  const t = useTranslations("pricing");
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const [isYearly, setIsYearly] = useState(false);
  const { user } = useAuth();

  const handleCta = (plan: "free" | "starter" | "pro") => {
    if (user) {
      router.push(plan === "free" ? "/dashboard" : "/upgrade");
    } else {
      router.push(plan === "free" ? "/signup" : `/signup?plan=${plan}`);
    }
  };

  const tiers: Tier[] = [
    {
      name: t("tier1Name"), price: t("tier1Price"), period: t("tier1Period"),
      tagline: t("tier1Tagline"),
      features: [t("tier1Feature1"), t("tier1Feature2"), t("tier1Feature3"), t("tier1Feature4")],
      cta: t("tier1Cta"), popular: false, ctaOnClick: () => handleCta("free"),
    },
    {
      name: t("tier2Name"), price: t("tier2Price"), priceYearly: t("tier2PriceYearly"),
      period: t("tier2Period"), periodYearly: t("tier2PeriodYearly"),
      tagline: t("tier2Tagline"),
      features: [t("tier2Feature1"), t("tier2Feature2"), t("tier2Feature3"), t("tier2Feature4"), t("tier2Feature5"), t("tier2Feature6")],
      cta: t("tier2Cta"), popular: true, badge: t("tier2Badge"), ctaOnClick: () => handleCta("starter"),
    },
    {
      name: t("tier3Name"), price: t("tier3Price"), priceYearly: t("tier3PriceYearly"),
      period: t("tier3Period"), periodYearly: t("tier3PeriodYearly"),
      tagline: t("tier3Tagline"),
      features: [t("tier3Feature1"), t("tier3Feature2"), t("tier3Feature3"), t("tier3Feature4"), t("tier3Feature5"), t("tier3Feature6")],
      cta: t("tier3Cta"), popular: false, ctaOnClick: () => handleCta("pro"),
    },
  ];

  return (
    <section id="pricing" className="relative scroll-mt-20 overflow-hidden py-24 md:py-40 px-6 md:px-12 bg-black">
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-10 md:mb-12"
        >
          <p className="text-[13px] font-medium tracking-[0.18em] text-[#86868b] uppercase mb-6">{t("eyebrow")}</p>
          <h2 className="font-bold leading-[1.05] tracking-tight text-white mb-6"
            style={{ fontSize: "clamp(40px, 6vw, 80px)" }}>
            {t("title")}{" "}
            <span className="ai-gradient-text">{t("titleEm")}</span>
          </h2>
          <p className="text-xl text-[#86868b] max-w-xl mx-auto leading-[1.47]">{t("sub")}</p>
        </motion.div>

        {/* Billing toggle — segmented pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center mb-16"
        >
          <div className="relative inline-flex items-center rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] p-1">
            {/* Monthly */}
            <button
              onClick={() => setIsYearly(false)}
              className="relative px-5 py-2 rounded-full text-sm font-medium cursor-pointer"
            >
              {!isYearly && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 rounded-full bg-[rgba(255,255,255,0.12)]"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className={cn("relative z-10 transition-colors duration-200", !isYearly ? "text-white" : "text-[#6E6E73]")}>
                {t("billingMonthly")}
              </span>
            </button>

            {/* Yearly */}
            <button
              onClick={() => setIsYearly(true)}
              className="relative px-5 py-2 rounded-full text-sm font-medium cursor-pointer"
            >
              {isYearly && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 rounded-full bg-[rgba(255,255,255,0.12)]"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className={cn("relative z-10 inline-flex items-center gap-2 transition-colors duration-200", isYearly ? "text-white" : "text-[#6E6E73]")}>
                {t("billingYearly")}
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-white transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(135deg,#BF5AF2,#0A84FF)",
                    opacity: isYearly ? 1 : 0.4,
                  }}
                >
                  {t("yearlyBadge")}
                </span>
              </span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start py-6">
          {tiers.map((tier, i) => (
            <PricingCard key={tier.name} tier={tier} index={i} reduced={reduced} isYearly={isYearly} />
          ))}
        </div>
      </div>
    </section>
  );
}
