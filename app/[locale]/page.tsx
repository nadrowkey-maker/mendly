// Section order:
// 0. Nav       — sticky header, locale switcher, CTA
// 1. Hero      — aurora shader bg, vapour text, liquid-glass CTAs
// 2. Problem   — cold phosphor bg, GlowCard stat cards
// 3. Promise   — shader-animation rings bg, GradientText, Fraunces editorial
// — — —
// 4. How It Works (coming soon)
// 5. Team      (coming soon)
// 6. Action    (coming soon)
// 7. Deliverables (coming soon)
// — — —
// 8. Comparison — table, radial-shader bg
// — — —
// 9. Pricing   (coming soon)
// — — —
// 10. Trust    — cobe-globe, neno-shader, trust cards
// 11. Final CTA — digital-petals + raidal-2 bg, manifesto, LiquidButton
// 12. Footer   — 4-column links

import { Nav } from "@/components/layout/Nav";
import { Hero } from "@/components/sections/Hero";
import { ProblemSection } from "@/components/sections/Problem";
import { PromiseSection } from "@/components/sections/Promise";
import { TeamSection } from "@/components/sections/Team";
import { Comparison } from "@/components/sections/Comparison";
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
        <TeamSection />
        <Comparison />
        <Trust />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
