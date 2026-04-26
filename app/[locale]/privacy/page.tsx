import { getTranslations } from "next-intl/server";
import { PageWrapper } from "@/components/layout/PageWrapper";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: `${t("title")} · Mendly`,
    description: "How Mendly handles and protects your personal data.",
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });

  const sections = [
    { title: t("s1Title"), body: t("s1Body") },
    { title: t("s2Title"), body: t("s2Body") },
    { title: t("s3Title"), body: t("s3Body") },
    { title: t("s4Title"), body: t("s4Body") },
    { title: t("s5Title"), body: t("s5Body") },
    { title: t("s6Title"), body: t("s6Body") },
    { title: t("s7Title"), body: t("s7Body") },
    { title: t("s8Title"), body: t("s8Body") },
    { title: t("s9Title"), body: t("s9Body") },
    { title: t("s10Title"), body: t("s10Body") },
  ];

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          {t("title")}
        </h1>
        <p className="text-sm text-(--text-dim) mb-16 font-mono">
          {t("lastUpdated")}
        </p>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i} className="border-b border-[var(--border)] pb-10 last:border-none">
              <h2 className="text-lg font-semibold text-white mb-3">
                {section.title}
              </h2>
              <p className="text-(--text-muted) leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
