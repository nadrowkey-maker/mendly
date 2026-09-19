import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { WaitlistForm } from "@/components/sections/WaitlistForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "waitlist" });
  // Page héritée, plus reliée à aucune autre : indexée, elle ferait doublon
  // avec l'accueil sur les mêmes mots.
  return buildMetadata({
    locale,
    path: "/waitlist",
    title: t("metaTitle"),
    description: t("metaDescription"),
    absoluteTitle: true,
    index: false,
  });
}

export default function WaitlistPage() {
  return (
    <PageWrapper>
      <WaitlistForm />
    </PageWrapper>
  );
}
