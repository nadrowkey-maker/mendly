"use client";

import { useTranslations } from "next-intl";
import { LayoutDashboard, Radio, FolderClosed } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AppHeader } from "@/components/app/AppHeader";
import { ProjectIntake } from "@/components/dashboard/ProjectIntake";
import { DEMO_PROJECTS, DEMO_EMAIL } from "@/components/preview/fixtures";
import type { NavGroup } from "@/components/app/nav-types";

/**
 * L'entretien de création, pour la capture de la section « commencer ».
 *
 * C'est le composant réel : sa première réplique est écrite en dur dans le
 * produit, elle s'affiche donc ici sans appel au modèle. La capture montre
 * exactement ce qu'un nouveau fondateur voit à la seconde où il arrive.
 */
export function PreviewIntake() {
  const t = useTranslations("newProject");
  const tSide = useTranslations("sidebar");

  const groups: NavGroup[] = [
    {
      label: tSide("groupOverview"),
      items: [
        { label: tSide("overview"), icon: LayoutDashboard },
        { label: tSide("whispers"), icon: Radio },
      ],
    },
    {
      label: tSide("groupProjects"),
      action: { label: tSide("newProject"), href: "/dashboard/new" },
      items: DEMO_PROJECTS.map((p) => ({ label: p.name, icon: FolderClosed })),
    },
  ];

  return (
    <AppShell
      groups={groups}
      usageUsed={4}
      usageLimit={10}
      userPlan="free"
      userEmail={DEMO_EMAIL}
      flush
    >
      <AppHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <ProjectIntake onSwitchToForm={() => {}} />
      </div>
    </AppShell>
  );
}
