import { Nav } from "@/components/layout/Nav";
import { HeroInput } from "@/components/sections/HeroInput";
import { ProblemSection } from "@/components/sections/Problem";
import { Comparison } from "@/components/sections/Comparison";
import { HowItWorksSection } from "@/components/sections/HowItWorks";
import { TeamSection } from "@/components/sections/Team";
import { WhatYouGetSection } from "@/components/sections/WhatYouGet";
import { SoloFounderProof } from "@/components/sections/SoloFounderProof";
import { PricingSection } from "@/components/sections/Pricing";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCtaSection } from "@/components/sections/FinalCta";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function HomePage() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main className="bg-(--apple-bg)">
        <HeroInput />
        <ProblemSection />
        <Comparison />
        <HowItWorksSection />
        <TeamSection />
        <WhatYouGetSection />
        <SoloFounderProof />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
