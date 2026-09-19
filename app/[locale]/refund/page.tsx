import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { DocumentPage } from "@/components/home/DocumentPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "refund" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({ locale, path: "/refund", title: t("title"), description: seo("refund") });
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
