import { PageWrapper } from "@/components/layout/PageWrapper";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata = {
  title: "API Docs · Mendly",
  description: "Mendly API documentation.",
  robots: { index: false, follow: true },
};

export default function ApiDocsPage() {
  return (
    <PageWrapper>
      <ComingSoon />
    </PageWrapper>
  );
}
