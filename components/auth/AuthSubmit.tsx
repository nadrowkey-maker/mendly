"use client";

/**
 * Le bouton de validation des formulaires d'authentification.
 *
 * Pilule blanche pleine largeur, comme l'action principale de la landing —
 * c'est le même geste, il doit avoir la même apparence. Pas de pastille à
 * flèche ici : celle-ci signale un déplacement, alors qu'on soumet un
 * formulaire.
 */
interface AuthSubmitProps {
  loading: boolean;
  children: React.ReactNode;
}

export function AuthSubmit({ loading, children }: AuthSubmitProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full cursor-pointer rounded-full bg-white px-5 py-3 text-sm font-semibold tracking-tight text-black transition-all hover:-translate-y-px hover:shadow-[0_8px_30px_-8px_rgba(255,255,255,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow) disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      {children}
    </button>
  );
}
