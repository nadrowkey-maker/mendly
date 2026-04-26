import { getTranslations } from "next-intl/server";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { SecurityContent } from "@/components/sections/SecurityContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "security" });
  return {
    title: `${t("title")} · Mendly`,
    description: t("subtitle"),
    robots: { index: true, follow: true },
  };
}

export default function SecurityPage() {
  return (
    <PageWrapper>
      <SecurityContent />
    </PageWrapper>
  );
}
