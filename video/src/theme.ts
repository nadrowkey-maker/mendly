import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Easing } from "remotion";

/**
 * La charte de la vidéo : celle du produit, transposée au format vertical.
 *
 * Mêmes polices, mêmes teintes, mêmes matières que la page d'accueil. Une pub
 * qui ne ressemble pas au site sur lequel elle envoie fait perdre au clic la
 * confiance qu'elle vient de gagner.
 */

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const { fontFamily: SANS } = loadManrope("normal", {
  weights: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const { fontFamily: MONO } = loadMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

export const C = {
  paper: "#FBFAF8",
  paperRaised: "#F3F1ED",
  ink: "#0E0E0F",
  inkSoft: "#55555B",
  inkMuted: "#8B8B92",
  shell: "#0A0A0B",
  panel: "#161617",
  panelRaised: "#1E1E20",
  line: "rgba(255,255,255,0.08)",
  azure: "#3AA8FF",
  glow: "#8FD4FF",
  warm: "#FFD79A",
  signal: "#FFB454",
  verdict: "#35C78C",
} as const;

/**
 * Zones sûres TikTok.
 *
 * Le haut (≈10 %) porte l'onglet « Pour toi », la droite (≈10 %) les icônes
 * j'aime / commentaire / partage, le bas (≈20 %) la légende, le son et le
 * bouton d'appel à l'action de la publicité. Aucun texte utile n'y descend.
 */
export const SAFE = { top: 210, bottom: 420, left: 80, right: 140 } as const;

/** La courbe de sortie du site : départ vif, arrivée posée. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
