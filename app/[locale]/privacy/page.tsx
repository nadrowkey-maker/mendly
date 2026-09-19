import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { DocumentPage } from "@/components/home/DocumentPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({ locale, path: "/privacy", title: t("title"), description: seo("privacy") });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });

  const sections = Array.from({ length: 10 }, (_, i) => ({
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
