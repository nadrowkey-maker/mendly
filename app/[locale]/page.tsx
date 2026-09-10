import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PaperNav } from "@/components/home/PaperNav";
import { Hero } from "@/components/home/Hero";
import { Proof } from "@/components/home/Proof";
import { Showcase } from "@/components/home/Showcase";
import { Features } from "@/components/home/Features";
import { GetStarted } from "@/components/home/GetStarted";
import { PaperPricing } from "@/components/home/PaperPricing";
import { Faq } from "@/components/home/Faq";
import { Closing } from "@/components/home/Closing";
import { PaperFooter } from "@/components/home/PaperFooter";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.meta" });
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
 * La page d'accueil.
 *
 * Elle est claire alors que le produit est sombre, et c'est délibéré. La
 * vitrine se consulte une fois, souvent au téléphone et parfois dehors :
 * elle doit se lire au soleil. L'atelier se regarde des heures d'affilée
 * devant un écran : il doit fatiguer le moins possible. Les deux contraintes
 * n'ont pas la même réponse, et vouloir une seule charte pour les deux revient
 * à mal servir l'une des deux.
 *
 * Le champ de particules a disparu d'ici. Il tenait le rôle de fond animé,
 * et deux dispositifs génératifs sur la même page se disputaient l'attention
 * sans que ni l'un ni l'autre ne gagne. Le ruban et les dégradés granuleux le
 * remplacent : même principe — calculé, jamais un fichier récupéré ailleurs —
 * mais posés là où ils servent le propos plutôt qu'en fond permanent.
 */
export default function HomePage() {
  return (
    <div className="paper min-h-screen">
      <PaperNav />
      <main>
        <Hero />
        <div className="mt-4 md:mt-8">
          <Proof />
        </div>
        <div className="mt-24 md:mt-32">
          <Showcase />
        </div>
        <div className="mt-32 md:mt-44">
          <Features />
        </div>
        <div className="mt-28 md:mt-40">
          <GetStarted />
        </div>
        <div className="mt-28 md:mt-40">
          <PaperPricing />
        </div>
        <div className="mt-28 md:mt-36">
          <Faq />
        </div>
        <Closing />
      </main>
      <PaperFooter />
    </div>
  );
}
