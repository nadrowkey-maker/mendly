import { Nav } from "@/components/layout/Nav";
import { Hero } from "@/components/sections/Hero";
import { ProblemSection } from "@/components/sections/Problem";
import { PromiseSection } from "@/components/sections/Promise";
import { HowItWorksSection } from "@/components/sections/HowItWorks";
import { TeamSection } from "@/components/sections/Team";
import { ActionSection } from "@/components/sections/Action";
import { DeliverablesSection } from "@/components/sections/Deliverables";
import { Comparison } from "@/components/sections/Comparison";
import { PricingSection } from "@/components/sections/Pricing";
import { Trust } from "@/components/sections/Trust";
import { FinalCtaSection } from "@/components/sections/FinalCta";
import { Footer } from "@/components/layout/Footer";
import { routing } from "@/i18n/routing";
import { SectionTransition } from "@/components/ui/SectionTransition";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        {/* 🚨 LA CORRECTION EST ICI : Le Hero n'a plus de SectionTransition ! */}
        <Hero /> 
        
        <SectionTransition><ProblemSection /></SectionTransition>
        <SectionTransition><PromiseSection /></SectionTransition>
        <SectionTransition><HowItWorksSection /></SectionTransition>
        
        {/* TeamSection: has its own 500vh sticky scroll animation — must not be wrapped */}
        <TeamSection />
        
        <SectionTransition><ActionSection /></SectionTransition>
        <SectionTransition><DeliverablesSection /></SectionTransition>
        <SectionTransition><Comparison /></SectionTransition>
        <SectionTransition><PricingSection /></SectionTransition>
        <SectionTransition><Trust /></SectionTransition>
        <SectionTransition><FinalCtaSection /></SectionTransition>
      </main>
      <Footer />
    </>
  );
}