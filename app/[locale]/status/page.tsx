import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { PageWrapper } from "@/components/layout/PageWrapper";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "status" });
  return {
    title: `${t("title")} · Mendly`,
    description: t("sub"),
    robots: { index: true, follow: true },
  };
}

/**
 * La page d'état.
 *
 * Choix assumé : aucune pastille verte "tous les systèmes opérationnels".
 * Sans supervision continue, ce voyant serait décoratif — il afficherait
 * "opérationnel" pendant une panne, ce qui est pire que ne rien afficher.
 *
 * À la place, la page renvoie vers les pages d'état réelles des prestataires
 * dont Mendly dépend. C'est vérifiable, tenu à jour par leurs équipes, et
 * réellement utile à quelqu'un qui cherche pourquoi le service ne répond pas.
 */
const DEPENDENCIES = [
  { key: "vercel", name: "Vercel", url: "https://www.vercel-status.com" },
  { key: "supabase", name: "Supabase", url: "https://status.supabase.com" },
  { key: "google", name: "Google AI", url: "https://status.cloud.google.com" },
  { key: "stripe", name: "Stripe", url: "https://status.stripe.com" },
  { key: "brevo", name: "Brevo", url: "https://status.brevo.com" },
] as const;

export default async function StatusPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "status" });

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl px-6 py-20 md:px-8 md:py-28">
        <header className="mb-12 border-b border-(--glass-line) pb-10">
          <h1 className="text-balance text-3xl font-extralight tracking-[-0.03em] text-white md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-5 text-(--text-secondary)">{t("sub")}</p>
        </header>

        <section className="mb-12">
          <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-(--text-muted)">
            {t("depsTitle")}
          </h2>
          <p className="mb-6 text-sm text-(--text-secondary)">{t("depsSub")}</p>

          <ul className="flex flex-col gap-2">
            {DEPENDENCIES.map((dep) => (
              <li key={dep.key}>
                <a
                  href={dep.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-(--glass-line) bg-(--glass) px-5 py-4 backdrop-blur-xl transition-colors hover:border-(--glass-hi) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-glow)"
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium text-white">{dep.name}</span>
                    <span className="block text-sm text-(--text-secondary)">{t(dep.key)}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-mono text-xs text-(--text-muted) transition-colors group-hover:text-(--accent-glow)"
                  >
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10 rounded-2xl border border-(--glass-line) bg-(--glass) p-6 backdrop-blur-xl">
          <h2 className="mb-2 text-lg font-medium tracking-tight text-white">
            {t("incidentTitle")}
          </h2>
          <p className="mb-5 text-(--text-secondary)">{t("incidentBody")}</p>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)"
          >
            {t("incidentCta")}
          </Link>
        </section>

        <section className="border-t border-(--glass-line) pt-8">
          <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-(--text-muted)">
            {t("honestyTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-(--text-secondary)">{t("honestyBody")}</p>
        </section>
      </div>
    </PageWrapper>
  );
}
