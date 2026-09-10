"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { LayoutDashboard, Radio, FolderClosed, ExternalLink, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AppHeader } from "@/components/app/AppHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { DangerZone } from "@/components/settings/DangerZone";
import { PrivacyReassurance } from "@/components/project/PrivacyReassurance";
import { PillLink } from "@/components/ui/Pill";
import type { UserProfile } from "@/lib/types/profile";
import type { Project } from "@/lib/types/project";
import type { NavGroup } from "@/components/app/nav-types";

/**
 * Les paramètres.
 *
 * Le fichier faisait 444 lignes et portait quatre écrans dans un seul : le
 * compte, le profil, la facturation et la suppression. Chacun est parti dans
 * son fichier — non par principe de découpage, mais parce que la zone de
 * suppression, la seule qui détruit des données, était noyée au milieu d'un
 * formulaire de préférences.
 *
 * L'écran reprend le châssis de l'atelier : mêmes panneaux, même barre, même
 * en-tête. Les réglages n'ont aucune raison d'être un endroit à part — c'est en
 * les mettant à part qu'on finit par les oublier dans les refontes.
 */
interface SettingsClientProps {
  userEmail: string;
  profile: UserProfile | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
  hasActiveSubscription: boolean;
  projects: Project[];
  usageUsed: number;
  usageLimit: number;
}

export function SettingsClient({
  userEmail,
  profile,
  subscriptionPlan,
  subscriptionStatus,
  hasActiveSubscription,
  projects,
  usageUsed,
  usageLimit,
}: SettingsClientProps) {
  const t = useTranslations("settings");
  const tSide = useTranslations("sidebar");
  const locale = useLocale();
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Portal error");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setPortalLoading(false);
      // L'ancienne version appelait alert() : une boîte système au milieu de
      // l'application, impossible à styler et bloquante. Le message reste dans
      // la page, à côté du bouton qui a échoué.
      setPortalError(t("portalError"));
    }
  };

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
      userPlan={subscriptionPlan}
      userEmail={userEmail}
    >
      <AppHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="space-y-4 px-6 py-8 md:px-10">
        <SettingsSection title={t("accountTitle")} subtitle={t("accountSubtitle")}>
          <dl className="divide-y divide-(--panel-line)">
            <Row label={t("emailLabel")} value={userEmail} />
            <Row
              label={t("planLabel")}
              value={subscriptionPlan}
              hint={subscriptionPlan !== "free" ? subscriptionStatus : undefined}
              capitalize
            />
          </dl>
        </SettingsSection>

        <SettingsSection title={t("profileTitle")} subtitle={t("profileSubtitle")}>
          <ProfileForm profile={profile} />
        </SettingsSection>

        <SettingsSection title={t("billingTitle")} subtitle={t("billingSubtitle")}>
          {subscriptionPlan === "free" ? (
            <PillLink href="/upgrade" tone="light" size="md">
              {t("seePlans")}
            </PillLink>
          ) : (
            <button
              type="button"
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-(--panel-line) px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-white/6 disabled:opacity-50"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  {t("loading")}
                </>
              ) : (
                <>
                  {t("manageBilling")}
                  <ExternalLink className="size-3.5" />
                </>
              )}
            </button>
          )}
          {portalError && (
            <p role="alert" className="mt-3 text-[13px] text-red-300">
              {portalError}
            </p>
          )}
        </SettingsSection>

        <DangerZone hasActiveSubscription={hasActiveSubscription} />

        <PrivacyReassurance className="pt-4" />
      </div>
    </AppShell>
  );
}

function Row({
  label,
  value,
  hint,
  capitalize,
}: {
  label: string;
  value: string;
  hint?: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-[12.5px] text-white/40">{label}</dt>
      <dd className="flex items-center gap-3">
        <span
          className={[
            "text-[13.5px] font-medium text-white",
            capitalize ? "capitalize" : "",
          ].join(" ")}
        >
          {value}
        </span>
        {hint && <span className="text-[11px] text-(--accent-glow)">{hint}</span>}
      </dd>
    </div>
  );
}
