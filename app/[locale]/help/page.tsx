import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { PageWrapper } from "@/components/layout/PageWrapper";

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
 * JavaScript : le composant reste un composant serveur, fonctionne sans JS,
 * est navigable au clavier par défaut, et le texte des réponses est présent
 * dans le HTML — donc indexable et trouvable par la recherche du navigateur,
 * même replié.
 *
 * Chaque réponse décrit ce que le produit fait réellement. Une page d'aide qui
 * promet plus que le code ne tient est pire que pas de page d'aide.
 */
export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "help" });

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl px-6 py-20 md:px-8 md:py-28">
        <header className="mb-12 border-b border-(--glass-line) pb-10">
          <h1 className="text-balance text-3xl font-extralight tracking-[-0.03em] text-white md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-5 text-(--text-secondary)">{t("sub")}</p>
        </header>

        <div className="flex flex-col gap-2">
          {QUESTIONS.map((n) => (
            <details
              key={n}
              className="group rounded-2xl border border-(--glass-line) bg-(--glass) px-5 backdrop-blur-xl transition-colors open:bg-white/6 hover:border-(--glass-hi)"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-white marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-glow)">
                <span className="text-[15px] font-medium">{t(`q${n}`)}</span>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="size-4 shrink-0 text-(--text-muted) transition-transform group-open:rotate-45"
                >
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </summary>
              <p className="pb-5 pr-8 leading-relaxed text-(--text-secondary)">{t(`a${n}`)}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 border-t border-(--glass-line) pt-10 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)"
          >
            {t("contactCta")}
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
