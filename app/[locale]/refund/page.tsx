import { getTranslations } from "next-intl/server";
import { DocumentPage } from "@/components/home/DocumentPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "refund" });
  return {
    title: `${t("title")} · Mendly`,
    description: "La politique de remboursement et de résiliation de Mendly.",
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "refund" });

  const sections = Array.from({ length: 6 }, (_, i) => ({
    title: t(`s${i + 1}Title`),
    body: t(`s${i + 1}Body`),
  }));

  return (
    <DocumentPage
      title={t("title")}
      lastUpdated={t("lastUpdated")}
      sections={sections}
    />
  );
}
