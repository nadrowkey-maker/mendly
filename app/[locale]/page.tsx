import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Nav } from "@/components/layout/Nav";
import { EntityField } from "@/components/3d/EntityField";
import { HeroMission } from "@/components/sections/HeroMission";
import { Contradiction } from "@/components/sections/Contradiction";
import { NightWatch } from "@/components/sections/NightWatch";
import { PricingSection } from "@/components/sections/Pricing";
import { Closing } from "@/components/sections/Closing";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * La page d'accueil n'avait AUCUNE métadonnée : ni titre, ni description, ni
 * Open Graph. Les pages secondaires en avaient, la principale non — donc le
 * lien partagé ne montrait rien et le référencement travaillait à vide.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.meta" });
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * Landing — reconstruction "Contrôle Mission", page blanche.
 *
 * Les dix sections précédentes vendaient l'équipe de 8 agents, un produit qui
 * n'existe plus. Elles sont retirées d'un bloc plutôt que retouchées : le
 * discours doit être réécrit, pas repeint. Les sections reviennent une par une,
 * chacune posant `data-entity-shape` pour piloter l'état de l'entité de fond.
 */
export default function HomePage() {
  return (
    <>
      <SmoothScroll />
      <EntityField />
      <div className="relative z-10">
        <Nav />
        <main>
          <HeroMission />
          <Contradiction />
          <NightWatch />
          <PricingSection />
          <Closing />
        </main>
        <Footer />
      </div>
    </>
  );
}
