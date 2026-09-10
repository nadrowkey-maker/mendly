"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { GrainGradient, type GrainColorway } from "@/components/ui/GrainGradient";
import { PillAction } from "@/components/ui/Pill";

/**
 * La coque des écrans d'authentification.
 *
 * Un panneau coupé en deux : l'adresse à gauche sur fond sombre, les champs à
 * droite posés sur le dégradé granuleux. La séparation n'est pas décorative —
 * elle sépare ce qu'on lit une fois de ce qu'on remplit. Un formulaire centré
 * sur fond uni mélange les deux et donne à la connexion l'allure d'un péage.
 *
 * Le bouton de validation vit dans le panneau sombre, en bas à gauche, à
 * l'opposé du dernier champ. Ce n'est pas un accident de maquette : il ferme
 * la phrase commencée par le titre.
 *
 * La grille est explicite plutôt que faite de deux colonnes empilées, parce
 * que l'ordre change avec la largeur. Sur téléphone il faut lire le titre,
 * remplir, puis valider ; en colonnes, le bouton se retrouverait au-dessus des
 * champs.
 */
interface AuthShellProps {
  title: string;
  subtitle: string;
  /** Les champs — posés sur le dégradé. */
  children: React.ReactNode;
  /** Libellé du bouton de validation. */
  submitLabel: string;
  loading?: boolean;
  /** Message d'erreur, affiché au-dessus des champs. */
  error?: string | null;
  onSubmit: (e: React.FormEvent) => void;
  /** Le lien de bascule — s'inscrire, se connecter, mot de passe oublié. */
  footer?: React.ReactNode;
  backLabel: string;
  /** Change le coloris du dégradé pour distinguer les quatre écrans. */
  colorway?: GrainColorway;
  seed?: number;
}

export function AuthShell({
  title,
  subtitle,
  children,
  submitLabel,
  loading = false,
  error,
  onSubmit,
  footer,
  backLabel,
  colorway = "azure",
  seed = 19,
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-(--shell) px-4 py-10 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl"
      >
        <div className="mb-6 flex items-center justify-between px-1">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-tight text-white transition-opacity hover:opacity-65"
          >
            mendly
          </Link>
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 transition-colors hover:text-white"
          >
            {backLabel}
          </Link>
        </div>

        <form
          onSubmit={onSubmit}
          aria-label={title}
          className="grid overflow-hidden rounded-[26px] bg-(--panel) md:grid-cols-2 md:grid-rows-[1fr_auto]"
        >
          <div className="order-1 bg-(--panel) px-7 pt-9 pb-6 md:order-none md:col-start-1 md:row-start-1 md:px-10 md:pt-12">
            <h1 className="text-balance text-[27px] leading-[1.12] font-semibold tracking-[-0.03em] text-white md:text-[32px]">
              {title}
            </h1>
            <p className="mt-3 max-w-xs text-[13.5px] leading-relaxed text-white/45">{subtitle}</p>
          </div>

          <div className="relative order-2 md:order-none md:col-start-2 md:row-span-2 md:row-start-1">
            <GrainGradient
              colorway={colorway}
              seed={seed}
              grain={0.6}
              className="absolute inset-0 size-full"
            />
            <div className="relative space-y-5 px-6 py-9 md:px-10 md:py-12">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-white/85 px-4 py-3 text-[13px] font-medium text-red-700 backdrop-blur-sm"
                >
                  {error}
                </div>
              )}
              {children}
            </div>
          </div>

          <div className="order-3 bg-(--panel) px-7 pt-2 pb-9 md:order-none md:col-start-1 md:row-start-2 md:px-10 md:pb-12">
            <PillAction type="submit" tone="light" size="lg" block disabled={loading}>
              {submitLabel}
            </PillAction>
            {footer && (
              <div className="mt-5 text-center text-[13px] text-white/40 md:text-left">
                {footer}
              </div>
            )}
          </div>
        </form>
      </motion.div>
    </main>
  );
}
