"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import { PillAction } from "@/components/ui/Pill";
import type { PlanTier } from "@/lib/stripe/plans";

/**
 * L'action d'une carte de plan : ouvrir le paiement, ou le portail si c'est
 * déjà le plan en cours.
 *
 * Deux cas sont nommés au lieu d'aboutir à un message générique :
 * — un plan payant sans client Stripe (attribué directement en base) n'a pas
 *   de portail à ouvrir ; on le dit, sans bouton qui échouerait ;
 * — une panne Stripe s'affiche dans la carte, jamais dans un `alert()`, qui
 *   bloque la page et ne dit pas quoi faire.
 */
interface PlanCheckoutButtonProps {
  plan: Exclude<PlanTier, "free">;
  label: string;
  loadingLabel: string;
  featured?: boolean;
  /** C'est le plan en cours : le bouton ouvre le portail de facturation. */
  isCurrent: boolean;
  /** Un client Stripe existe. */
  canManage: boolean;
  errorLabel: string;
  manualLabel: string;
}

export function PlanCheckoutButton({
  plan,
  label,
  loadingLabel,
  featured,
  isCurrent,
  canManage,
  errorLabel,
  manualLabel,
}: PlanCheckoutButtonProps) {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isCurrent && !canManage) {
    return <p className="text-[12.5px] leading-relaxed text-white/55">{manualLabel}</p>;
  }

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(isCurrent ? "/api/stripe/portal" : "/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isCurrent ? { locale } : { plan, locale }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "stripe_error");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(
        err instanceof Error && err.message === "no_stripe_customer" ? manualLabel : errorLabel
      );
    }
  };

  return (
    <div>
      <PillAction
        tone={featured ? "light" : "ghost"}
        size="lg"
        block
        onClick={handleClick}
        disabled={loading}
        icon={loading ? <Loader2 className="size-4 animate-spin" /> : undefined}
        className={
          featured ? undefined : "border border-white/15 text-white opacity-100 hover:bg-white/8"
        }
      >
        {loading ? loadingLabel : label}
      </PillAction>
      {error && (
        <p role="alert" className="mt-3 text-[12.5px] leading-relaxed text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
