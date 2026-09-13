import { getTranslations } from "next-intl/server";
import { PaperPage } from "@/components/home/PaperPage";
import { Manifesto } from "@/components/sections/Manifesto";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "manifesto" });
  return {
    title: `${t("title")} · Mendly`,
    description: t("subtitle"),
    robots: { index: true, follow: true },
  };
}

export default function ManifestoPage() {
  return (
    <PaperPage>
      <Manifesto />
    </PaperPage>
  );
}
