import { getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/legal/LegalDocument";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return {
    title: `${t("title")} · Mendly`,
    description: "Les conditions générales d'utilisation de Mendly.",
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });

  const sections = Array.from({ length: 11 }, (_, i) => ({
    title: t(`s${i + 1}Title`),
    body: t(`s${i + 1}Body`),
  }));

  return (
    <LegalDocument
      title={t("title")}
      lastUpdated={t("lastUpdated")}
      sections={sections}
    />
  );
}
