import { PageWrapper } from "@/components/layout/PageWrapper";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata = {
  title: "Blog · Mendly",
  description: "Stories and insights from the Mendly team.",
  robots: { index: false, follow: true },
};

export default function BlogPage() {
  return (
    <PageWrapper>
      <ComingSoon />
    </PageWrapper>
  );
}
