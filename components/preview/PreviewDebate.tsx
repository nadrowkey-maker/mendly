"use client";

import { useTranslations } from "next-intl";
import { MessageSquare, Brain, FileStack, FolderClosed, Users } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AppHeader } from "@/components/app/AppHeader";
import { TeamRoomHeader } from "@/components/chat/TeamRoomView";
import { DebateView } from "@/components/chat/DebateView";
import { DEMO_DEBATE, DEMO_EMAIL, DEMO_PROJECT, DEMO_PROJECTS } from "@/components/preview/fixtures";
import type { NavGroup } from "@/components/app/nav-types";

/**
 * La salle de réunion en plein débat, pour la vidéo publicitaire.
 *
 * Ce sont les composants réels du débat — fil des spécialistes, changement
 * d'avis signalé, synthèse, votes — nourris par un débat de démonstration
 * terminé. La publicité montre ainsi l'écran que le fondateur verra, pas une
 * illustration de ce qu'un débat pourrait être.
 */
export function PreviewDebate() {
  const tSide = useTranslations("sidebar");
  const t = useTranslations("chat");

  const groups: NavGroup[] = [
    {
      label: tSide("groupProject"),
      items: [
        { label: tSide("conversation"), icon: MessageSquare },
        { label: tSide("teamRoomLabel"), icon: Users, active: true },
        { label: tSide("memory"), icon: Brain },
        { label: tSide("deliverables"), icon: FileStack },
      ],
    },
    {
      label: tSide("groupProjects"),
      items: DEMO_PROJECTS.map((p) => ({
        label: p.name,
        icon: FolderClosed,
        active: p.id === DEMO_PROJECT.id,
      })),
    },
  ];

  return (
    <AppShell
      groups={groups}
      usageUsed={4}
      usageLimit={10}
      userPlan="starter"
      userEmail={DEMO_EMAIL}
      contextLabel={DEMO_PROJECT.name}
    >
      <AppHeader title={t("teamRoomNav")} subtitle={DEMO_PROJECT.name} />
      <div className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <TeamRoomHeader project={DEMO_PROJECT} />
          <DebateView state={DEMO_DEBATE} onAbort={() => {}} />
        </div>
      </div>
    </AppShell>
  );
}
