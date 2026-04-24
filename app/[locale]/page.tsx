// Section order:
// 0.  Nav          — sticky header, locale switcher, CTA
// 1.  Hero         — aurora shader bg, vapour text, liquid-glass CTAs
// 2.  Problem      — cold phosphor bg, GlowCard stat cards
// 3.  Promise      — shader-animation rings bg, GradientText, Fraunces editorial
// 4.  HowItWorks   — horizontal connected timeline, ambient violet glow
// 5.  Team         — Spline robot fullscreen, scroll-driven 8 agent cards
// 6.  Action       — agent chat mockup, staggered messages, typing indicator
// 7.  Deliverables — 2-row perspective infinite marquee
// 8.  Comparison   — table, radial-shader bg
// 9.  Pricing      — 4-tier cards, popular badge, LiquidButton CTAs
// 10. Trust        — cobe-globe, neno-shader, trust cards
// 11. Final CTA    — digital-petals + radial-2 bg, manifesto, LiquidButton
// 12. Footer       — 4-column links

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProblemSection />
        <PromiseSection />
        <HowItWorksSection />
        <TeamSection />
        <ActionSection />
        <DeliverablesSection />
        <Comparison />
        <PricingSection />
        <Trust />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
