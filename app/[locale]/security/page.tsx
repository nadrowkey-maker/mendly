import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { PaperPage } from "@/components/home/PaperPage";
import { SecurityPledge } from "@/components/sections/SecurityPledge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "security" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({ locale, path: "/security", title: t("title"), description: seo("security") });
}

export default function SecurityPage() {
  return (
    <PaperPage>
      <SecurityPledge />
    </PaperPage>
  );
}
