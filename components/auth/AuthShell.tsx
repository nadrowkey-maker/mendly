"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { EntityField } from "@/components/3d/EntityField";

/**
 * La coque des écrans d'authentification.
 *
 * Les quatre pages (connexion, inscription, mot de passe oublié, réinitialisation)
 * dupliquaient chacune leur propre fond, leur propre carte et leurs propres
 * styles de champ. Une correction de charte en touchait une sur quatre.
 *
 * Elle reprend l'entité de la landing plutôt qu'un dégradé statique : c'est le
 * premier écran après la page d'accueil, et voir la même chose respirer
 * derrière la carte fait la continuité. Une rupture visuelle à cet instant
 * précis casse la confiance qu'on vient d'obtenir.
 */
interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  backLabel: string;
}

export function AuthShell({ title, subtitle, children, footer, backLabel }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-black px-6 py-20">
      <EntityField />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-9 text-center">
          <Link
            href="/"
            className="mb-8 inline-block text-sm font-bold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)"
          >
            Mend<span className="text-(--accent-primary)">l</span>y
          </Link>
          <h1 className="text-balance text-3xl font-extralight leading-tight tracking-[-0.03em] text-white md:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm text-(--text-secondary)">{subtitle}</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-(--glass-line) bg-[rgba(8,11,15,0.72)] p-6 shadow-[inset_0_1px_0_var(--glass-hi),0_40px_100px_-50px_var(--accent-halo)] backdrop-blur-2xl md:p-8">
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm text-(--text-secondary)">{footer}</div>}

        <div className="mt-5 text-center">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--text-muted) transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)"
          >
            {backLabel}
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
