import { PageWrapper } from "@/components/layout/PageWrapper";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata = {
  title: "Help Center · Mendly",
  description: "Guides and support for Mendly.",
  robots: { index: false, follow: true },
};

export default function HelpPage() {
  return (
    <PageWrapper>
      <ComingSoon />
    </PageWrapper>
  );
}
