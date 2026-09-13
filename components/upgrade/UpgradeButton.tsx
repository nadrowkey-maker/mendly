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
  /** Message affiché dans la page si Stripe ne répond pas. */
  errorLabel: string;
  /** Message affiché quand le plan n'a pas d'abonnement Stripe derrière lui. */
  manualLabel: string;
  /** L'utilisateur a un client Stripe : le portail peut s'ouvrir. */
  canManage: boolean;
}

export function UpgradeButton({
  plan,
  label,
  loadingLabel,
  featured,
  disabled,
  currentPlan,
  manageLabel,
  errorLabel,
  manualLabel,
  canManage,
}: Props) {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCurrentPlan = currentPlan === plan;
  const showPortal = isCurrentPlan && plan !== "free";

  const handleClick = async () => {
    setLoading(true);
    setError(null);
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
      /*
       * Plus de boîte `alert()` générique. C'est elle qui affichait « Une
       * erreur est survenue » sur un compte passé en payant à la main : le
       * portail n'a rien à ouvrir sans client Stripe, et le message ne le
       * disait pas. Le cas est nommé, et le message reste dans la page.
       */
      setError(
        err instanceof Error && err.message === "no_stripe_customer" ? manualLabel : errorLabel
      );
    }
  };

  // Un plan payant sans client Stripe (attribué directement en base) : il n'y
  // a pas de portail à ouvrir, on le dit au lieu d'offrir un bouton qui échoue.
  if (showPortal && !canManage) {
    return <p className="text-center text-xs leading-relaxed text-(--text-muted)">{manualLabel}</p>;
  }

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
    <>
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
    {error && (
      <p role="alert" className="mt-3 text-center text-xs text-red-300">
        {error}
      </p>
    )}
    </>
  );
}