import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PaperNav } from "@/components/home/PaperNav";
import { Hero } from "@/components/home/Hero";
import { Proof } from "@/components/home/Proof";
import { Showcase } from "@/components/home/Showcase";
import { Features } from "@/components/home/Features";
import { GetStarted } from "@/components/home/GetStarted";
import { Pillars } from "@/components/home/Pillars";
import { PaperPricing } from "@/components/home/PaperPricing";
import { Faq } from "@/components/home/Faq";
import { Closing } from "@/components/home/Closing";
import { PaperFooter } from "@/components/home/PaperFooter";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqSchema, graph, organizationSchema, softwareSchema, websiteSchema } from "@/lib/seo/schema";

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

  return buildMetadata({
    locale,
    path: "/",
    title: t("title"),
    description: t("description"),
    absoluteTitle: true,
  });
}

/**
 * Ce que la page déclare aux moteurs, en plus de ce qu'elle montre.
 *
 * Les six questions fréquentes sont reprises telles quelles : ce sont les
 * questions que les gens posent vraiment, et c'est ce qui permet à une
 * recherche du type « IA qui contredit » ou « alternative à ChatGPT pour
 * fondateur » de tomber sur la réponse plutôt que sur la page d'accueil.
 */
async function homeGraph(locale: string) {
  const meta = await getTranslations({ locale, namespace: "home.meta" });
  const faq = await getTranslations({ locale, namespace: "home.faq" });
  const pricing = await getTranslations({ locale, namespace: "landing.pricing" });
  const description = meta("description");

  const plans = (["free", "starter", "pro"] as const).map((tier) => ({
    name: pricing(`${tier}.name`),
    price: pricing(`${tier}.price`),
    description: pricing(`${tier}.tagline`),
  }));

  const questions = [1, 2, 3, 4, 5, 6].map((i) => ({
    question: faq(`q${i}`),
    answer: faq(`a${i}`),
  }));

  return graph([
    organizationSchema(locale),
    websiteSchema(locale, description),
    softwareSchema(locale, description, plans),
    faqSchema(questions),
  ]);
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
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="paper min-h-screen">
      <JsonLd data={await homeGraph(locale)} />
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
          <Pillars />
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
