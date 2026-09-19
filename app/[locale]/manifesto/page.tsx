import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { PaperPage } from "@/components/home/PaperPage";
import { Manifesto } from "@/components/sections/Manifesto";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "manifesto" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({ locale, path: "/manifesto", title: t("title"), description: seo("manifesto") });
}

export default function ManifestoPage() {
  return (
    <PaperPage>
      <Manifesto />
    </PaperPage>
  );
}
