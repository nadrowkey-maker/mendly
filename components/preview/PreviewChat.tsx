"use client";

import { useTranslations } from "next-intl";
import { MessageSquare, Brain, FileStack, FolderClosed, Users } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AppHeader } from "@/components/app/AppHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { TeamRoomHeader } from "@/components/chat/TeamRoomView";
import { DEMO_PROJECT, DEMO_PROJECTS, DEMO_EMAIL, DEMO_EXCHANGE } from "@/components/preview/fixtures";
import type { NavGroup } from "@/components/app/nav-types";

/**
 * La scène de conversation, pour les captures de la vitrine.
 *
 * Elle assemble les composants réels de l'atelier — châssis, barre latérale,
 * en-tête, bulle de message, zone de saisie — avec le projet de démonstration.
 * Rien n'est redessiné ici : si un jour la bulle de message change, la capture
 * suivante montrera la nouvelle bulle sans qu'on ait à y penser.
 *
 * La zone de saisie ne fait rien : ces pages ne sont servies qu'en
 * développement, le temps de la capture.
 */
interface PreviewChatProps {
  /** `room` bascule sur l'en-tête de la salle de réunion. */
  variant: "conversation" | "room";
  /** Affiche le bouton d'orientation vers la salle sous la réponse. */
  withRoomSuggestion?: boolean;
}

export function PreviewChat({ variant, withRoomSuggestion }: PreviewChatProps) {
  const t = useTranslations("chat");
  const tSide = useTranslations("sidebar");
  const isRoom = variant === "room";

  const groups: NavGroup[] = [
    {
      label: tSide("groupProject"),
      items: [
        { label: tSide("conversation"), icon: MessageSquare, active: !isRoom },
        { label: tSide("teamRoomLabel"), icon: Users, active: isRoom },
        { label: tSide("memory"), icon: Brain },
        { label: tSide("deliverables"), icon: FileStack },
      ],
    },
    {
      label: tSide("groupProjects"),
      action: { label: tSide("newProject"), href: "/dashboard/new" },
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
      userPlan="free"
      userEmail={DEMO_EMAIL}
      contextLabel={DEMO_PROJECT.name}
      flush
    >
      <AppHeader
        title={isRoom ? t("teamRoomNav") : tSide("conversation")}
        subtitle={DEMO_PROJECT.name}
      />

      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {isRoom && <TeamRoomHeader project={DEMO_PROJECT} />}

          <ChatMessage role="user" content={DEMO_EXCHANGE.question} />
          <div>
            <ChatMessage role="assistant" content={DEMO_EXCHANGE.answer} agentRole="MENDLY" />
            {withRoomSuggestion && (
              <div className="mt-3 flex w-full items-start gap-3 rounded-2xl border border-(--accent-primary)/35 bg-(--accent-primary)/8 px-4 py-3 text-left">
                <Users className="mt-0.5 size-4 shrink-0 text-(--accent-glow)" />
                <span className="min-w-0">
                  <span className="block font-mono text-[10px] tracking-[0.18em] text-(--accent-glow) uppercase">
                    {t("openRoomLabel")}
                  </span>
                  <span className="mt-0.5 block text-sm text-white">
                    {DEMO_EXCHANGE.roomSuggestion}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ChatComposer
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        busy={false}
        isDebating={false}
        agentLabel={isRoom ? t("teamRoomNav") : "Mendly"}
      />
    </AppShell>
  );
}
