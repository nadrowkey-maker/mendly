"use client";

import { useTranslations } from "next-intl";
import { LayoutDashboard, Radio, FolderClosed, Check } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AppHeader } from "@/components/app/AppHeader";
import { GrainGradient } from "@/components/ui/GrainGradient";
import { PlanCheckoutButton } from "@/components/upgrade/PlanCheckoutButton";
import type { PlanTier } from "@/lib/stripe/plans";
import type { Project } from "@/lib/types/project";
import type { NavGroup } from "@/components/app/nav-types";

/**
 * Le choix du plan, dans l'atelier.
 *
 * C'était la dernière page de l'application restée sur l'ancienne charte :
 * fond noir absolu, halo bleu, badge à éclair. On y arrive depuis la barre
 * latérale et depuis les réglages, c'est-à-dire au milieu du travail — la page
 * doit donc avoir le châssis de l'atelier, pas l'allure d'un site à part.
 *
 * Les prix et les noms viennent des mêmes clés que la grille de la page
 * d'accueil. Deux jeux de prix écrits à deux endroits finissent toujours par
 * diverger, et le jour où ça arrive, c'est un visiteur qui s'en aperçoit.
 *
 * La carte mise en avant porte la matière sombre de l'orbe : c'est le seul
 * endroit de l'atelier où un bloc entier est coloré, et il désigne le choix.
 */
interface UpgradeClientProps {
  userEmail: string;
  plan: PlanTier;
  hasStripeCustomer: boolean;
  projects: Project[];
  usageUsed: number;
  usageLimit: number;
}

const PAID = [
  { tier: "starter", featured: true },
  { tier: "pro", featured: false },
] as const;

const FEATURES = [1, 2, 3, 4, 5] as const;

export function UpgradeClient({
  userEmail,
  plan,
  hasStripeCustomer,
  projects,
  usageUsed,
  usageLimit,
}: UpgradeClientProps) {
  const t = useTranslations("upgrade");
  const tPrice = useTranslations("landing.pricing");
  const tSide = useTranslations("sidebar");

  const groups: NavGroup[] = [
    {
      label: tSide("groupOverview"),
      items: [
        { label: tSide("overview"), icon: LayoutDashboard, href: "/dashboard" },
        { label: tSide("whispers"), icon: Radio, href: "/dashboard/whispers" },
      ],
    },
    {
      label: tSide("groupProjects"),
      action: { label: tSide("newProject"), href: "/dashboard/new" },
      items: projects.map((p) => ({
        label: p.name,
        icon: FolderClosed,
        href: `/dashboard/projects/${p.id}`,
      })),
    },
  ];

  return (
    <AppShell
      groups={groups}
      usageUsed={usageUsed}
      usageLimit={usageLimit}
      userPlan={plan}
      userEmail={userEmail}
    >
      <AppHeader title={t("title")} subtitle={t("sub")} />

      <div className="px-6 py-8 md:px-10">
        {plan !== "free" && (
          <p className="mb-6 inline-flex rounded-full border border-(--panel-line) px-3.5 py-1.5 text-[12.5px] text-white/70">
            {t("currentPlan", { plan: tPrice(`${plan}.name` as "starter.name") })}
          </p>
        )}

        <div className="grid max-w-4xl gap-4 md:grid-cols-2">
          {PAID.map(({ tier, featured }) => {
            const isCurrent = plan === tier;
            const name = tPrice(`${tier}.name` as "starter.name");
            const label = isCurrent
              ? t("manage")
              : plan === "free"
                ? t("startCheckout")
                : t("switchTo", { plan: name });

            return (
              <article
                key={tier}
                className={[
                  "relative flex flex-col overflow-hidden rounded-3xl p-7 md:p-8",
                  featured ? "bg-(--shell)" : "bg-(--panel)",
                ].join(" ")}
              >
                {featured && (
                  <>
                    <GrainGradient
                      colorway="dusk"
                      seed={29}
                      grain={0.5}
                      className="absolute inset-0 size-full"
                    />
                    {/* Voile : garde un contraste stable au texte, où que passe
                        la tache la plus claire. */}
                    <div className="absolute inset-0 bg-black/30" />
                  </>
                )}

                <div className="relative flex flex-1 flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-[20px] font-bold tracking-tight text-white">{name}</h2>
                    {(isCurrent || featured) && (
                      <span className="rounded-full bg-white/12 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/75">
                        {isCurrent ? t("activeBadge") : t("popular")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[13px] text-white/55">
                    {tPrice(`${tier}.tagline` as "starter.tagline")}
                  </p>

                  <p className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-[40px] font-bold tracking-tight text-white">
                      {tPrice(`${tier}.price` as "starter.price")}
                    </span>
                    <span className="text-[13px] text-white/45">
                      {tPrice(`${tier}.period` as "starter.period")}
                    </span>
                  </p>

                  <ul className="mt-6 mb-8 flex-1 space-y-3 border-t border-white/10 pt-6">
                    {FEATURES.map((n) => (
                      <li key={n} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-white/75">
                        <Check className="mt-0.5 size-4 shrink-0 text-white/40" aria-hidden="true" />
                        {t(`${tier}.f${n}` as "starter.f1")}
                      </li>
                    ))}
                  </ul>

                  <PlanCheckoutButton
                    plan={tier}
                    label={label}
                    loadingLabel={t("loading")}
                    featured={featured}
                    isCurrent={isCurrent}
                    canManage={hasStripeCustomer}
                    errorLabel={t("error")}
                    manualLabel={t("manualPlan")}
                  />
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-6 font-mono text-[11px] tracking-wide text-white/35">{t("footer")}</p>
      </div>
    </AppShell>
  );
}
