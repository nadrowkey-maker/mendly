import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { PaperPage } from "@/components/home/PaperPage";
import { ContactDesk } from "@/components/sections/ContactDesk";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({ locale, path: "/contact", title: t("title"), description: seo("contact") });
}

export default function ContactPage() {
  return (
    <PaperPage>
      <ContactDesk />
    </PaperPage>
  );
}
