/**
 * La palette du film.
 *
 * Un blanc légèrement froid plutôt que le papier chaud de la page d'accueil :
 * à l'écran d'un téléphone, le froid se lit comme de la lumière, le chaud
 * comme du papier. Les captures du produit, sombres, s'y détachent comme des
 * objets posés dans la lumière — c'est tout le contraste de la référence.
 */
export const LOOK = {
  mist: "#F4F6FA",
  ink: "#0E0E0F",
  inkSoft: "#5B5E68",
  inkFaint: "#9CA0AB",
  azure: "#3AA8FF",
  glow: "#8FD4FF",
  deep: "#1D6FBD",
  lavender: "#C9D4FF",
  warm: "#FFD79A",
  night: "#05080F",
} as const;

/** Le dégradé d'accent, réservé à un seul mot par phrase. */
export const ACCENT_GRADIENT = "linear-gradient(95deg, #1D6FBD 0%, #3AA8FF 48%, #8FD4FF 100%)";
