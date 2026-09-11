"use client";

import { useTranslations } from "next-intl";
import { MessageSquare, Brain, FileStack, FolderClosed, Users } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AppHeader } from "@/components/app/AppHeader";
import { SpeakingBar } from "@/components/app/SpeakingBar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { MendlyOrb } from "@/components/ui/MendlyOrb";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { useReveal } from "@/lib/hooks/use-reveal";
import { DEMO_PROJECT, DEMO_PROJECTS, DEMO_EMAIL, DEMO_EXCHANGE } from "@/components/preview/fixtures";
import type { NavGroup } from "@/components/app/nav-types";

/**
 * La scène de conversation, rejouée sur la vitrine.
 *
 * Elle assemble les composants réels de l'atelier — châssis, barre latérale,
 * en-tête, bulle de message, orbe — avec un projet fictif. Rien n'est
 * redessiné : le jour où la bulle de message change, la démonstration montre
 * la nouvelle bulle sans que personne ait à y penser. Une maquette dessinée
 * dérive de la réalité en deux refontes et se met à promettre un produit qui
 * n'existe pas.
 *
 * Les sept phases suivent l'ordre réel d'un échange, y compris ses temps
 * morts : on voit le curseur chercher la zone de saisie avant d'écrire. Sauter
 * ces temps donnerait une démonstration plus courte et beaucoup moins
 * crédible.
 */

/** Les phases, nommées — un numéro nu dans les comparaisons ne se relit pas. */
export const PHASE = {
  IDLE: 0,
  FOCUS: 1,
  TYPING: 2,
  SENT: 3,
  STREAMING: 4,
  ANSWERED: 5,
  ROOM: 6,
} as const;

interface ConversationSceneProps {
  phase: number;
}

export function ConversationScene({ phase }: ConversationSceneProps) {
  const t = useTranslations("chat");
  const tSide = useTranslations("sidebar");

  const typed = useReveal(DEMO_EXCHANGE.question, phase === PHASE.TYPING, 1500);
  const streamed = useReveal(DEMO_EXCHANGE.stageAnswer, phase === PHASE.STREAMING, 3400);

  const sent = phase >= PHASE.SENT;
  const speaking = phase === PHASE.SENT || phase === PHASE.STREAMING;
  const answer =
    phase >= PHASE.ANSWERED
      ? DEMO_EXCHANGE.stageAnswer
      : phase === PHASE.STREAMING
        ? streamed
        : "";

  const groups: NavGroup[] = [
    {
      label: tSide("groupProject"),
      items: [
        { label: tSide("conversation"), icon: MessageSquare, active: true },
        { label: tSide("teamRoomLabel"), icon: Users },
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
      userPlan="free"
      userEmail={DEMO_EMAIL}
      contextLabel={DEMO_PROJECT.name}
      flush
      inStage
    >
      <SpeakingBar active={speaking} />
      <AppHeader title={tSide("conversation")} subtitle={DEMO_PROJECT.name} />

      {/* L'accueil se centre, la conversation part du haut. L'ancrage en bas
          semblait plus juste — c'est ce que fait un fil qui a défilé — mais sur
          un échange de deux messages il ouvrait un vide noir de trois cents
          pixels au-dessus de la question. */}
      <div
        className={[
          "relative z-10 flex flex-1 flex-col overflow-hidden px-8 py-8",
          sent ? "justify-start" : "justify-center",
        ].join(" ")}
      >
        <div className="mx-auto w-full max-w-3xl space-y-6">
          {!sent ? (
            <div className="pt-10 text-center">
              <div className="mb-6 flex justify-center">
                <MendlyOrb size={104} speaking={speaking} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {t("welcomeTitle")}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-(--text-secondary)">
                {t("welcomeBodyMENDLY", { projectName: DEMO_PROJECT.name })}
              </p>
            </div>
          ) : (
            <>
              <ChatMessage role="user" content={DEMO_EXCHANGE.question} />

              <div className="flex gap-4">
                <MendlyOrb size={34} speaking={speaking} className="mt-1" />
                <div className="min-w-0 flex-1">
                  {answer ? (
                    <ChatMessage
                      role="assistant"
                      content={answer}
                      agentRole="MENDLY"
                      isStreaming={phase === PHASE.STREAMING}
                    />
                  ) : (
                    <ThinkingDots />
                  )}

                  {phase >= PHASE.ROOM && (
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
            </>
          )}
        </div>
      </div>

      {/* La vraie zone de saisie, branchée sur des fonctions vides. Elle
          affiche la frappe sans rien accepter : le plateau est une vitrine, et
          un visiteur qui parviendrait à y écrire attendrait une réponse. */}
      <ChatComposer
        value={phase === PHASE.TYPING ? typed : ""}
        onChange={() => {}}
        onSubmit={() => {}}
        busy={speaking}
        isDebating={false}
        agentLabel="Mendly"
      />
    </AppShell>
  );
}

/** Le temps d'attente avant le premier mot — court, mais il existe vraiment. */
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`size-1.5 rounded-full bg-(--accent-glow) typing-dot-${i + 1}`}
        />
      ))}
    </div>
  );
}
