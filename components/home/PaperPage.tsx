import type { ReactNode } from "react";
import { PaperNav } from "@/components/home/PaperNav";
import { PaperFooter } from "@/components/home/PaperFooter";

/**
 * La coque des pages annexes : manifeste, contact, aide, sécurité, état du
 * service, documents légaux.
 *
 * Elles vivaient encore dans l'ancienne coque sombre, avec l'ancienne barre et
 * l'ancien pied de page. On quittait la vitrine claire par un lien du pied de
 * page et on atterrissait sur un autre site — c'est précisément à cet endroit
 * que se lisent les pages de confiance, et c'est là que la rupture coûtait le
 * plus cher.
 *
 * Même barre, même pied, même papier que la page d'accueil.
 */
interface PaperPageProps {
  children: ReactNode;
}

export function PaperPage({ children }: PaperPageProps) {
  return (
    <div className="paper flex min-h-screen flex-col">
      <PaperNav />
      <main className="flex-1">{children}</main>
      <div className="mt-24 md:mt-32">
        <PaperFooter />
      </div>
    </div>
  );
}
