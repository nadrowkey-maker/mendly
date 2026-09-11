"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AppSidebar } from "@/components/app/AppSidebar";
import type { NavGroup } from "@/components/app/nav-types";

/**
 * Le châssis de l'atelier : le sol, le panneau latéral, la zone de travail.
 *
 * Le sol reste visible tout autour du panneau — deux unités de marge suffisent.
 * C'est le seul détail qui distingue cette mise en page d'un tableau de bord
 * générique à colonne fixe, et il ne coûte rien : le panneau cesse d'être un
 * bord d'écran et devient un objet posé.
 *
 * Sous 768 px le panneau sort en tiroir. Le réduire à une bande d'icônes,
 * comme le faisait la version précédente, revenait à afficher des pictogrammes
 * sans étiquette sur l'écran où l'on a le moins de place pour deviner.
 */
interface AppShellProps {
  groups: NavGroup[];
  usageUsed: number;
  usageLimit: number;
  userPlan: string;
  userEmail: string | null;
  contextLabel?: string | null;
  children: React.ReactNode;
  /** Retire le rembourrage de la zone de travail — pour le chat, qui gère le sien. */
  flush?: boolean;
  /**
   * Rendu à l'intérieur du plateau de démonstration de la vitrine.
   *
   * Le châssis occupe normalement la hauteur de la fenêtre. Sur un plateau, il
   * doit occuper celle de son conteneur : sans cela, la scène ferait la
   * hauteur de l'écran du visiteur au lieu de celle du cadre, et le bas de
   * l'interface sortirait du plateau.
   */
  inStage?: boolean;
}

export function AppShell({
  groups,
  usageUsed,
  usageLimit,
  userPlan,
  userEmail,
  contextLabel,
  children,
  flush,
  inStage,
}: AppShellProps) {
  const [drawer, setDrawer] = useState(false);

  const sidebar = (
    <AppSidebar
      groups={groups}
      usageUsed={usageUsed}
      usageLimit={usageLimit}
      userPlan={userPlan}
      userEmail={userEmail}
      contextLabel={contextLabel}
    />
  );

  return (
    <div
      className={[
        "flex gap-0 overflow-hidden bg-(--shell) p-2 md:gap-2",
        inStage ? "h-full" : "h-dvh",
      ].join(" ")}
    >
      <div className={inStage ? "block" : "hidden md:block"}>{sidebar}</div>

      {/* Tiroir mobile : le voile ferme au clic, ce que l'ancienne barre
          réduite ne permettait pas — on restait coincé en mode icônes. */}
      {drawer && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="close"
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative m-2 h-[calc(100dvh-1rem)]">{sidebar}</div>
        </div>
      )}

      {/* La zone de travail n'a pas de fond à elle : c'est le sol. Lui donner
          un panneau ferait deux surfaces de valeurs voisines côte à côte, et
          la barre latérale cesserait de se détacher — c'est exactement ce qui
          fait ressembler un atelier à un explorateur de fichiers. */}
      <main
        className={[
          // `relative` ancre le bandeau de parole, qui est en position
          // absolue. Sans lui, il remontait jusqu'au premier ancêtre positionné
          // et débordait sur la barre latérale — la lumière de Mendly éclairait
          // la navigation, qui n'a rien à voir avec ce qu'il est en train de
          // dire.
          "relative flex min-w-0 flex-1 flex-col overflow-hidden",
          flush ? "" : "overflow-y-auto",
        ].join(" ")}
      >
        {!inStage && (
          <button
            type="button"
            onClick={() => setDrawer((v) => !v)}
            aria-label="menu"
            className="m-3 grid size-9 shrink-0 place-items-center rounded-xl bg-white/6 text-white/70 transition-colors hover:bg-white/10 md:hidden"
          >
            {drawer ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        )}
        {children}
      </main>
    </div>
  );
}
