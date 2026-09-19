import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { DocumentPage } from "@/components/home/DocumentPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "imprint" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({ locale, path: "/legal", title: t("title"), description: seo("legal") });
}

const KEYS = ["publisher", "hosting", "director", "credits", "ip", "contact"] as const;

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "imprint" });

  const sections = KEYS.map((k) => ({ title: t(`${k}Title`), body: t(`${k}Body`) }));

  return <DocumentPage title={t("title")} sections={sections} />;
}
