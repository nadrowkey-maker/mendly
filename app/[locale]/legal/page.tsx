import { getTranslations } from "next-intl/server";
import { DocumentPage } from "@/components/home/DocumentPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "imprint" });
  return {
    title: `${t("title")} · Mendly`,
    description: "Éditeur, hébergeur et informations légales de Mendly.",
    robots: { index: true, follow: true },
  };
}

const KEYS = ["publisher", "hosting", "director", "credits", "ip", "contact"] as const;

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "imprint" });

  const sections = KEYS.map((k) => ({ title: t(`${k}Title`), body: t(`${k}Body`) }));

  return <DocumentPage title={t("title")} sections={sections} />;
}
