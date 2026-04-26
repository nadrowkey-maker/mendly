import { PageWrapper } from "@/components/layout/PageWrapper";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata = {
  title: "Status · Mendly",
  description: "Mendly platform status and uptime.",
  robots: { index: false, follow: true },
};

export default function StatusPage() {
  return (
    <PageWrapper>
      <ComingSoon />
    </PageWrapper>
  );
}
