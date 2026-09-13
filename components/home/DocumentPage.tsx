import { PaperPage } from "@/components/home/PaperPage";
import { PaperHeader } from "@/components/home/PaperHeader";
import { stripLeadingNumber } from "@/lib/strip-number";

/**
 * Les documents légaux : confidentialité, conditions, cookies, remboursement,
 * mentions légales.
 *
 * Traitement volontairement sobre. Ce sont des textes qu'on parcourt pour y
 * chercher une information précise, pas qu'on lit d'une traite : la mesure est
 * calée sur une largeur de lecture confortable, chaque section porte son
 * numéro dans une colonne à part, et un filet les sépare. On doit pouvoir
 * balayer la page et s'arrêter au bon endroit.
 *
 * Le lavis de l'en-tête est neutre (`ash`). Un document juridique en couleur
 * se lirait comme une page de vente, et c'est la dernière chose qu'on veut
 * suggérer ici.
 */
interface DocumentSection {
  title: string;
  body: string;
}

interface DocumentPageProps {
  title: string;
  lastUpdated?: string;
  intro?: string;
  sections: DocumentSection[];
}

export function DocumentPage({ title, lastUpdated, intro, sections }: DocumentPageProps) {
  return (
    <PaperPage>
      <PaperHeader title={title} sub={intro} meta={lastUpdated} colorway="ash" />

      <article className="mx-auto max-w-3xl px-5 pt-14 md:px-8 md:pt-20">
        <ol className="border-t border-(--paper-line)">
          {sections.map((section, i) => {
            const heading = stripLeadingNumber(section.title);
            return (
              <li
                key={heading}
                className="grid gap-2 border-b border-(--paper-line) py-8 md:grid-cols-[3.5rem_1fr] md:gap-6 md:py-10"
              >
                <span className="font-mono text-[11px] tabular-nums text-(--ink-muted) md:pt-1.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-[17px] font-semibold tracking-tight text-(--ink)">
                    {heading}
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-[14.5px] leading-relaxed text-(--ink-soft)">
                    {section.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </article>
    </PaperPage>
  );
}
