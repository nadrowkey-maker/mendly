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
 * Choix assumé : aucune pastille verte « tous les systèmes opérationnels ».
 * Sans supervision continue, ce voyant serait décoratif — il afficherait
 * « opérationnel » pendant une panne, ce qui est pire que ne rien afficher.
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
    <PaperPage>
      <PaperHeader title={t("title")} sub={t("sub")} colorway="ash" />

      <section className="mx-auto max-w-3xl px-5 pt-14 md:px-8 md:pt-20">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--ink-muted)">
          {t("depsTitle")}
        </p>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-(--ink-soft)">{t("depsSub")}</p>

        <ul className="mt-8 border-t border-(--paper-line)">
          {DEPENDENCIES.map((dep) => (
            <li key={dep.key} className="border-b border-(--paper-line)">
              <a
                href={dep.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-6 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-primary)"
              >
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium tracking-tight text-(--ink)">
                    {dep.name}
                  </span>
                  <span className="mt-0.5 block text-[13.5px] text-(--ink-soft)">{t(dep.key)}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 font-mono text-[13px] text-(--ink-muted) transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--ink)"
                >
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-5 pt-14 md:px-8">
        <div className="rounded-3xl bg-(--paper-raised) p-7 md:p-10">
          <h2 className="text-[17px] font-semibold tracking-tight text-(--ink)">
            {t("incidentTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-(--ink-soft)">
            {t("incidentBody")}
          </p>
          <div className="mt-6">
            <PillLink href="/contact" tone="ink" size="md">
              {t("incidentCta")}
            </PillLink>
          </div>
        </div>

        <div className="mt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--ink-muted)">
            {t("honestyTitle")}
          </p>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-(--ink-soft)">
            {t("honestyBody")}
          </p>
        </div>
      </section>
    </PaperPage>
  );
}
