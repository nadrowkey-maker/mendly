// Section order:
// 0. Nav       — sticky header, locale switcher, CTA
// 1. Hero      — aurora shader bg, vapour text, liquid-glass CTAs
// — — —
// 2. Problem   (coming soon)
// 3. Promise   (coming soon)
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
// — — —
// 11. Final CTA (coming soon)
// 12. Footer   — 4-column links

import { Nav } from "@/components/layout/Nav";
import { Hero } from "@/components/sections/Hero";
import { Comparison } from "@/components/sections/Comparison";
import { Trust } from "@/components/sections/Trust";
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
        <Comparison />
        <Trust />
      </main>
      <Footer />
    </>
  );
}
