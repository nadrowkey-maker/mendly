"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MendlyOrb } from "@/components/ui/MendlyOrb";

/**
 * La pilule flottante — l'accès permanent à Mendly.
 *
 * Elle existe pour une raison précise : Mendly est un interlocuteur, et un
 * interlocuteur qui n'est joignable que depuis une page de l'application n'est
 * pas un interlocuteur, c'est un onglet. Où qu'on soit, la pilule est là.
 *
 * La bille est l'orbe, en miniature — le même composant qu'au centre de la
 * conversation, à une taille près. C'est ce qui signale que ce bouton n'est pas
 * une commande de l'interface mais quelqu'un à qui parler.
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
      <MendlyOrb size={32} />
      {t("askMendly")}
    </Link>
  );
}
