import { getTranslations } from "next-intl/server";
import { PaperPage } from "@/components/home/PaperPage";
import { ContactDesk } from "@/components/sections/ContactDesk";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: `${t("title")} · Mendly`,
    description: t("subtitle"),
    robots: { index: true, follow: true },
  };
}

export default function ContactPage() {
  return (
    <PaperPage>
      <ContactDesk />
    </PaperPage>
  );
}
