"use client";

import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { DEMO_PROJECTS, DEMO_EMAIL, DEMO_ACTIONS } from "@/components/preview/fixtures";

/**
 * Le tableau de bord, pour la capture qui illustre le travail nocturne.
 *
 * `DashboardClient` reçoit toutes ses données en propriétés — c'est ce qui
 * permet de le rendre ici tel quel, sans base ni session. Un composant qui
 * serait allé chercher ses données lui-même aurait dû être dupliqué pour la
 * capture, et la copie aurait divergé dès la refonte suivante.
 *
 * Le compteur de sessions non lues est à deux : c'est l'état qu'on veut
 * montrer — le fondateur ouvre son écran et l'équipe a travaillé sans lui.
 */
export function PreviewDashboard() {
  return (
    <DashboardClient
      projects={DEMO_PROJECTS}
      userEmail={DEMO_EMAIL}
      openActions={DEMO_ACTIONS}
      whisperCounts={{ "demo-project": 2 }}
      briefings={{
        "demo-project": {
          lastDecision: "Sortir trois pièces de test avant la collection complète",
          nextAction: "Mesurer la rétention des inscrits sur 14 jours",
        },
      }}
      stats={{ decisions: 14, unseenSessions: 2 }}
      userPlan="free"
      usageUsed={4}
      usageLimit={10}
    />
  );
}
