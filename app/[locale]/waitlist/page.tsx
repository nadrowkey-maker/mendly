import { getTranslations } from "next-intl/server";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { WaitlistForm } from "@/components/sections/WaitlistForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "waitlist" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function WaitlistPage() {
  return (
    <PageWrapper>
      <WaitlistForm />
    </PageWrapper>
  );
}
