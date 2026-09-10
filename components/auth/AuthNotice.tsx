"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { GrainGradient, type GrainColorway } from "@/components/ui/GrainGradient";
import { PillLink } from "@/components/ui/Pill";

/**
 * L'écran de confirmation — « regarde ta boîte mail », « mot de passe changé ».
 *
 * Même panneau coupé en deux que le formulaire, mais sans champ : ce qui
 * occupait la partie droite devient une seule information mise en valeur,
 * l'adresse à laquelle le message est parti. C'est la seule chose que la
 * personne cherche à cet instant, et la voir écrite noir sur blanc évite le
 * doute qui fait recommencer l'inscription avec une faute de frappe.
 *
 * Reprendre la coque du formulaire plutôt qu'un écran neutre entretient la
 * continuité : rien n'a cassé, on est simplement passé à l'étape suivante.
 */
interface AuthNoticeProps {
  title: string;
  subtitle: string;
  /** L'information mise en avant — typiquement l'adresse e-mail. */
  highlightLabel?: string;
  highlight?: string;
  /** L'action de sortie. */
  ctaLabel: string;
  ctaHref: string;
  backLabel: string;
  colorway?: GrainColorway;
  seed?: number;
}

export function AuthNotice({
  title,
  subtitle,
  highlightLabel,
  highlight,
  ctaLabel,
  ctaHref,
  backLabel,
  colorway = "verdict",
  seed = 41,
}: AuthNoticeProps) {
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

        <div className="grid overflow-hidden rounded-[26px] bg-(--panel) md:grid-cols-2">
          <div className="flex flex-col justify-between gap-8 px-7 py-9 md:px-10 md:py-12">
            <div>
              <h1 className="text-balance text-[27px] leading-[1.12] font-semibold tracking-[-0.03em] text-white md:text-[32px]">
                {title}
              </h1>
              <p className="mt-3 max-w-xs text-[13.5px] leading-relaxed text-white/45">
                {subtitle}
              </p>
            </div>
            <PillLink href={ctaHref} tone="light" size="lg" className="w-full">
              {ctaLabel}
            </PillLink>
          </div>

          <div className="relative min-h-52">
            <GrainGradient
              colorway={colorway}
              seed={seed}
              grain={0.6}
              className="absolute inset-0 size-full"
            />
            {highlight && (
              <div className="relative flex h-full items-center justify-center px-6 py-10 md:px-10">
                <div className="w-full rounded-2xl bg-white/92 px-5 py-4 text-center shadow-[0_10px_30px_-16px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                  {highlightLabel && (
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--ink-muted)">
                      {highlightLabel}
                    </p>
                  )}
                  <p className="mt-1.5 text-[14px] font-medium break-all text-(--ink)">
                    {highlight}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
