"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { MendlyOrb } from "@/components/ui/MendlyOrb";
import { PillAction } from "@/components/ui/Pill";
import type { Project } from "@/lib/types/project";

/**
 * L'accueil d'un projet : qui travaille dessus.
 *
 * L'ancienne séquence faisait défiler les huit rôles un par un, chacun avec son
 * rond de couleur et une réplique à la première personne (« Je suis ton CFO »).
 * Trois problèmes à la fois :
 * — elle présentait les huit rôles génériques, pas l'équipe réellement assignée
 *   au projet, alors que la page d'accueil promet « les spécialistes dont ton
 *   projet a besoin, et pas les autres » ;
 * — elle rejouait le produit à huit agents, celui qu'on a remplacé par une voix
 *   unique ;
 * — elle se mémorisait dans `localStorage`, une seule fois pour tous les
 *   projets : le deuxième projet n'était jamais présenté.
 *
 * Ici, c'est Mendly — l'orbe — qui présente l'équipe de CE projet, sur une
 * seule carte, sans couleur par spécialiste. L'accueil s'affiche tant que la
 * conversation du projet est vide, ce qui ne demande aucun stockage.
 */
const ROLES = ["CEO", "CTO", "CMO", "CPO", "CDO", "CFO", "DEV", "CCO"] as const;
type Role = (typeof ROLES)[number];

interface TeamIntroProps {
  project: Project;
  onDone: () => void;
}

export function TeamIntro({ project, onDone }: TeamIntroProps) {
  const t = useTranslations("teamIntro");
  const team = (project.assigned_agents ?? []).filter((r): r is Role =>
    (ROLES as readonly string[]).includes(r)
  );

  // Échap ferme, comme toute fenêtre modale.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  return (
    <AnimatePresence>
      <motion.div
        key="team-intro"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-intro-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="w-full max-w-md rounded-3xl bg-(--panel) p-8 text-center shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex justify-center">
            <MendlyOrb size={72} />
          </div>

          <h2 id="team-intro-title" className="mt-6 text-[22px] font-bold tracking-tight text-white">
            {t("title")}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/55">{t("sub")}</p>

          {team.length > 0 ? (
            <ul className="mt-7 border-t border-(--panel-line) text-left">
              {team.map((role, i) => (
                <motion.li
                  key={role}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-baseline gap-4 border-b border-(--panel-line) py-3"
                >
                  <span className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                    {t(`roles.${role}.name` as "roles.CEO.name")}
                  </span>
                  <span className="text-[13.5px] leading-snug text-white/75">
                    {t(`roles.${role}.focus` as "roles.CEO.focus")}
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="mt-7 rounded-2xl bg-white/4 px-4 py-3 text-[13px] leading-relaxed text-white/55">
              {t("noTeam")}
            </p>
          )}

          <p className="mt-6 text-[12.5px] leading-relaxed text-white/45">{t("mendlyLine")}</p>

          <div className="mt-7">
            <PillAction tone="light" size="lg" block onClick={onDone}>
              {t("letsGo")}
            </PillAction>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
