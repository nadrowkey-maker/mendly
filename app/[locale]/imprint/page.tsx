import { getTranslations } from "next-intl/server";
import { PageWrapper } from "@/components/layout/PageWrapper";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "imprint" });
  return {
    title: `${t("title")} · Mendly`,
    description: "Legal information about Mendly.",
    robots: { index: true, follow: true },
  };
}

export default async function ImprintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "imprint" });

  const sections = [
    { title: t("publisherTitle"), body: t("publisherBody") },
    { title: t("hostingTitle"), body: t("hostingBody") },
    { title: t("directorTitle"), body: t("directorBody") },
    { title: t("creditsTitle"), body: t("creditsBody") },
    { title: t("ipTitle"), body: t("ipBody") },
    { title: t("contactTitle"), body: t("contactBody") },
  ];

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-16">
          {t("title")}
        </h1>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i} className="border-b border-[var(--border)] pb-10 last:border-none">
              <h2 className="text-lg font-semibold text-white mb-3">
                {section.title}
              </h2>
              <p className="text-(--text-muted) leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
