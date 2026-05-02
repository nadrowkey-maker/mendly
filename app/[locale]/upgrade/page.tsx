import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Check, Zap } from "lucide-react";
import { getUserSubscription } from "@/lib/actions/subscription";
import { UpgradeButton } from "@/components/upgrade/UpgradeButton";
import type { PlanTier } from "@/lib/stripe/plans";

export default async function UpgradePage() {
  const t = await getTranslations("upgrade");
  const subscription = await getUserSubscription();
  const currentPlan = subscription.plan;

  const plans: {
    tier: PlanTier;
    name: string;
    price: string;
    featured: boolean;
    features: string[];
  }[] = [
    {
      tier: "starter",
      name: "Starter",
      price: "19",
      featured: true,
      features: [
        t("starter.f1"),
        t("starter.f2"),
        t("starter.f3"),
        t("starter.f4"),
        t("starter.f5"),
      ],
    },
    {
      tier: "pro",
      name: "Pro",
      price: "49",
      featured: false,
      features: [
        t("pro.f1"),
        t("pro.f2"),
        t("pro.f3"),
        t("pro.f4"),
        t("pro.f5"),
      ],
    },
  ];

  return (
    <main className="relative min-h-screen px-6 md:px-12 py-16 bg-(--bg-primary)">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(139,92,246,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <Link
          href="/dashboard"
          className="text-xs font-mono tracking-widest text-(--text-dim) hover:text-white uppercase transition-colors inline-block mb-10"
        >
          ← {t("backToDashboard")}
        </Link>

        <div className="text-center mb-14">
          <p className="text-[10px] font-mono tracking-[0.3em] text-(--accent-glow) uppercase mb-3">
            {t("eyebrow")}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("title")}
          </h1>
          <p className="text-(--text-muted) text-base max-w-xl mx-auto">
            {t("sub")}
          </p>
        </div>

        {currentPlan !== "free" && (
          <div className="mb-10 p-4 rounded-2xl border border-(--accent-glow)/30 bg-(--accent-glow)/5 text-center">
            <p className="text-sm text-white">
              {t("currentPlan", { plan: currentPlan.toUpperCase() })}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto w-full">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.tier;
            const buttonLabel = isCurrent
              ? t("manage")
              : currentPlan === "free"
                ? t("startCheckout")
                : t("switchTo", { plan: plan.name });

            return (
              <div
                key={plan.tier}
                className={[
                  "relative rounded-3xl border p-7 backdrop-blur-xl transition-all",
                  plan.featured
                    ? "border-(--accent-glow)/40 bg-(--accent-glow)/5"
                    : "border-(--border-strong) bg-(--surface)/40",
                  isCurrent ? "ring-2 ring-(--accent-glow)/60" : "",
                ].join(" ")}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-(--accent-glow) text-(--bg-primary) text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {t("popular")}
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-(--accent-glow)/20 border border-(--accent-glow)/40 text-[9px] font-mono uppercase tracking-wider text-(--accent-glow)">
                    {t("activeBadge")}
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-1">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-(--text-muted)">€</span>
                  <span className="text-sm text-(--text-dim)">
                    / {t("perMonth")}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-(--accent-glow) shrink-0 mt-0.5" />
                      <span className="text-(--text-muted)">{f}</span>
                    </li>
                  ))}
                </ul>

                <UpgradeButton
                  plan={plan.tier}
                  label={buttonLabel}
                  loadingLabel={t("loading")}
                  featured={plan.featured}
                  currentPlan={currentPlan}
                  manageLabel={t("manage")}
                />
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-(--text-dim) mt-10 font-mono">
          {t("footer")}
        </p>
      </div>
    </main>
  );
}