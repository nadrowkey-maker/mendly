import { getTranslations } from "next-intl/server";
import { PaperPage } from "@/components/home/PaperPage";
import { PaperHeader } from "@/components/home/PaperHeader";
import { PillLink } from "@/components/ui/Pill";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "help" });
  return {
    title: `${t("title")} · Mendly`,
    description: t("sub"),
    robots: { index: true, follow: true },
  };
}

const QUESTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * Le centre d'aide.
 *
 * Construit avec <details>/<summary> natifs plutôt qu'un accordéon en
 * JavaScript : la page reste un composant serveur, fonctionne sans JS, est
 * navigable au clavier par défaut, et le texte des réponses est présent dans
 * le HTML — donc indexable et trouvable par la recherche du navigateur, même
 * replié.
 *
 * Même dessin que les questions fréquentes de la page d'accueil : filets entre
 * les questions, signe « plus » qui pivote. Deux accordéons différents sur le
 * même site feraient deux manières d'apprendre à s'en servir.
 */
export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "help" });

  return (
    <PaperPage>
      <PaperHeader title={t("title")} sub={t("sub")} colorway="azure" />

      <section className="mx-auto max-w-3xl px-5 pt-14 md:px-8 md:pt-20">
        <div className="border-t border-(--paper-line)">
          {QUESTIONS.map((n) => (
            <details key={n} className="group border-b border-(--paper-line)">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-primary)">
                <span className="text-[15px] font-medium tracking-tight text-(--ink)">
                  {t(`q${n}` as "q1")}
                </span>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="size-4 shrink-0 text-(--ink-muted) transition-transform duration-300 group-open:rotate-45"
                >
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </summary>
              <p className="max-w-2xl pb-6 text-[14px] leading-relaxed text-(--ink-soft)">
                {t(`a${n}` as "a1")}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <PillLink href="/contact" tone="ink" size="lg">
            {t("contactCta")}
          </PillLink>
        </div>
      </section>
    </PaperPage>
  );
}
