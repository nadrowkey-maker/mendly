import { PageWrapper } from "@/components/layout/PageWrapper";

/**
 * La coque des documents légaux.
 *
 * Les cinq pages (confidentialité, CGU, cookies, remboursement, mentions
 * légales) répétaient exactement la même mise en page. Une correction de charte
 * en touchait une sur cinq, et rien ne garantissait qu'elles restent cohérentes.
 *
 * Traitement volontairement sobre : ce sont des textes qu'on lit en diagonale
 * pour y chercher une information précise. La mesure est calée sur une largeur
 * de lecture confortable, les sections sont numérotées et séparées par un
 * filet — on doit pouvoir balayer la page et s'arrêter au bon endroit.
 */
interface LegalSection {
  title: string;
  body: string;
}

/**
 * Certains namespaces portent déjà la numérotation dans le titre
 * ("1. Qui est responsable ?"), d'autres non. On la retire à l'affichage
 * plutôt que de réécrire les traductions : le numéro est une décision de mise
 * en page, pas du contenu, et le doubler serait la première chose qu'on voit.
 */
function stripLeadingNumber(title: string): string {
  return title.replace(/^\s*\d+\s*[.)–-]\s*/, "");
}

interface LegalDocumentProps {
  title: string;
  lastUpdated?: string;
  intro?: string;
  sections: LegalSection[];
}

export function LegalDocument({ title, lastUpdated, intro, sections }: LegalDocumentProps) {
  return (
    <PageWrapper>
      <article className="mx-auto max-w-2xl px-6 py-20 md:px-8 md:py-28">
        <header className="mb-14 border-b border-(--glass-line) pb-10">
          <h1 className="text-balance text-3xl font-extralight tracking-[-0.03em] text-white md:text-5xl">
            {title}
          </h1>
          {lastUpdated && (
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-(--text-muted)">
              {lastUpdated}
            </p>
          )}
          {intro && <p className="mt-6 text-(--text-secondary)">{intro}</p>}
        </header>

        <div className="flex flex-col gap-10">
          {sections.map((section, i) => (
            <section key={stripLeadingNumber(section.title)}>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="font-mono text-[11px] tabular-nums text-(--text-muted)">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-balance text-lg font-medium tracking-tight text-white">
                  {stripLeadingNumber(section.title)}
                </h2>
              </div>
              <p className="pl-6.75 leading-relaxed text-(--text-secondary)">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </article>
    </PageWrapper>
  );
}
