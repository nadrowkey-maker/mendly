import { PageWrapper } from "@/components/layout/PageWrapper";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata = {
  title: "Cookie Policy · Mendly",
  description: "How Mendly uses cookies.",
  robots: { index: false, follow: true },
};

export default function CookiesPage() {
  return (
    <PageWrapper>
      <ComingSoon />
    </PageWrapper>
  );
}
