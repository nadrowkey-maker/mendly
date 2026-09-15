import { notFound } from "next/navigation";
import { PreviewChat } from "@/components/preview/PreviewChat";
import { PreviewDashboard } from "@/components/preview/PreviewDashboard";
import { PreviewIntake } from "@/components/preview/PreviewIntake";
import { PreviewDebate } from "@/components/preview/PreviewDebate";

/**
 * Les scènes de capture.
 *
 * Elles existent pour produire les images du produit qui illustrent la page
 * d'accueil, et pour rien d'autre. D'où la fermeture en production : une route
 * publique montrant une interface connectée avec un compte fictif invite à se
 * demander de qui sont ces données. Ici, la question ne se pose pas — la page
 * n'est servie qu'en développement, le temps de prendre les captures.
 *
 * Elles ne sont donc pas non plus indexables, ni atteignables depuis un lien
 * du site : rien n'y mène.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Preview · Mendly",
  robots: { index: false, follow: false },
};

const SHOTS = ["workspace", "contradiction", "room", "debate", "night", "intake"] as const;
type Shot = (typeof SHOTS)[number];

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ shot: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { shot } = await params;
  if (!SHOTS.includes(shot as Shot)) notFound();

  switch (shot as Shot) {
    case "workspace":
      return <PreviewChat variant="conversation" />;
    case "contradiction":
      return <PreviewChat variant="conversation" withRoomSuggestion />;
    case "room":
      return <PreviewChat variant="room" />;
    case "night":
      return <PreviewDashboard />;
    case "intake":
      return <PreviewIntake />;
    case "debate":
      return <PreviewDebate />;
  }
}
