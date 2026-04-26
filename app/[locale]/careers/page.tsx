import { PageWrapper } from "@/components/layout/PageWrapper";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata = {
  title: "Careers · Mendly",
  description: "Join the Mendly team.",
  robots: { index: false, follow: true },
};

export default function CareersPage() {
  return (
    <PageWrapper>
      <ComingSoon />
    </PageWrapper>
  );
}
