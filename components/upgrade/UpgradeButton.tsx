"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import type { PlanTier } from "@/lib/stripe/plans";

interface Props {
  plan: PlanTier;
  label: string;
  loadingLabel: string;
  featured?: boolean;
  disabled?: boolean;
  currentPlan?: PlanTier;
  manageLabel?: string;
}

export function UpgradeButton({
  plan,
  label,
  loadingLabel,
  featured,
  disabled,
  currentPlan,
  manageLabel,
}: Props) {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const isCurrentPlan = currentPlan === plan;
  const showPortal = isCurrentPlan && plan !== "free";

  const handleClick = async () => {
    setLoading(true);
    try {
      const endpoint = showPortal
        ? "/api/stripe/portal"
        : "/api/stripe/checkout";
      const body = showPortal ? { locale } : { plan, locale };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Stripe error");
      }
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Une erreur est survenue. Réessaie.");
    }
  };

  if (isCurrentPlan && plan === "free") {
    return (
      <button
        disabled
        className="w-full py-3 rounded-full font-mono font-bold text-xs uppercase tracking-wider opacity-60 cursor-not-allowed border border-(--border-strong) text-(--text-muted)"
      >
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={[
        "w-full py-3 rounded-full font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        featured
          ? "bg-(--accent-glow) text-(--bg-primary) hover:bg-(--accent-glow)/90 shadow-lg shadow-(--accent-glow)/30"
          : "border border-(--border-strong) text-white hover:bg-(--surface)/60",
      ].join(" ")}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        showPortal ? manageLabel ?? label : label
      )}
    </button>
  );
}