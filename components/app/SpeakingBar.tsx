"use client";

import { ORB_COLORS } from "@/components/ui/MendlyOrb";

/**
 * Le bandeau du haut — la lumière que Mendly projette quand il écrit.
 *
 * Il porte exactement les teintes de l'orbe, et c'est le point. Le nuage
 * multicolore qu'il remplace avait sa propre palette : violet, rose, turquoise,
 * sans rapport avec l'orbe posé trente pixels plus bas. Deux palettes
 * voisines mais différentes sur le même écran ne se lisent pas comme deux
 * éléments, elles se lisent comme un défaut.
 *
 * Il éclaire le bord haut et s'éteint vers le bas, plutôt que de couvrir toute
 * la zone de travail. Une teinte posée sur l'ensemble de l'écran salit le
 * texte qu'on est justement en train de lire — c'est le défaut qu'avait le
 * nuage, et c'est la raison pour laquelle il était maintenu à 35 % d'opacité,
 * donc invisible, donc inutile.
 */
interface SpeakingBarProps {
  /** Mendly est en train d'écrire. */
  active: boolean;
}

export function SpeakingBar({ active }: SpeakingBarProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none absolute inset-x-0 top-0 z-20 h-40 transition-opacity duration-700",
        active ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {/* La nappe : large, très floue, elle ne dessine aucune forme. C'est une
          ambiance, pas un objet — dès qu'on distingue un contour, on cherche à
          savoir ce que c'est. */}
      <div
        className="absolute inset-x-0 top-0 h-full blur-3xl"
        style={{
          background: `radial-gradient(60% 100% at 30% 0%, ${ORB_COLORS.azure}40 0%, transparent 70%),
                       radial-gradient(50% 100% at 72% 0%, ${ORB_COLORS.warm}33 0%, transparent 72%),
                       radial-gradient(40% 90% at 50% 0%, ${ORB_COLORS.glow}2e 0%, transparent 75%)`,
        }}
      />

      {/* Le filet sur l'arête même. Il donne au bandeau un bord net, sans quoi
          la nappe floue passerait pour un halo d'écran mal calibré. */}
      <div
        className={[
          "absolute inset-x-0 top-0 h-px",
          active ? "animate-[speaking-pan_3.2s_linear_infinite]" : "",
        ].join(" ")}
        style={{
          backgroundImage: `linear-gradient(90deg, transparent, ${ORB_COLORS.azure}, ${ORB_COLORS.glow}, ${ORB_COLORS.warm}, ${ORB_COLORS.azure}, transparent)`,
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}
