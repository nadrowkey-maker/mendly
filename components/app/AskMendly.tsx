"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { GrainGradient } from "@/components/ui/GrainGradient";

/**
 * La pilule flottante — l'accès permanent à Mendly.
 *
 * Elle existe pour une raison précise : Mendly est un interlocuteur, et un
 * interlocuteur qui n'est joignable que depuis une page de l'application n'est
 * pas un interlocuteur, c'est un onglet. Où qu'on soit, la pilule est là.
 *
 * La bille est le dégradé granuleux en miniature, animé. C'est le seul endroit
 * de l'atelier où la matière de la vitrine réapparaît : elle signale que ce
 * bouton n'est pas une commande de l'interface mais quelqu'un à qui parler.
 */
interface AskMendlyProps {
  /** Le projet vers lequel ouvrir la conversation. */
  projectId: string | null;
}

export function AskMendly({ projectId }: AskMendlyProps) {
  const t = useTranslations("app");
  const href = projectId ? `/dashboard/projects/${projectId}` : "/dashboard/new";

  return (
    <Link
      href={href as never}
      className="group fixed right-5 bottom-5 z-30 flex items-center gap-2.5 rounded-full bg-white/92 py-1.5 pr-4 pl-1.5 text-[13.5px] font-medium text-(--ink) shadow-[0_14px_40px_-14px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5"
    >
      <span className="relative size-8 overflow-hidden rounded-full">
        <GrainGradient colorway="azure" seed={88} grain={0.7} className="size-full" />
      </span>
      {t("askMendly")}
    </Link>
  );
}
