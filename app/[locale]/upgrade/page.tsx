import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/actions/subscription";
import { listProjects } from "@/lib/actions/projects";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { UpgradeClient } from "@/components/upgrade/UpgradeClient";

export const metadata = {
  title: "Plans · Mendly",
  robots: { index: false, follow: false },
};

/**
 * Le choix du plan.
 *
 * La page lit l'abonnement, les projets et la consommation côté serveur, puis
 * confie l'affichage à un composant client : le châssis de l'atelier construit
 * sa navigation avec des icônes, qui ne peuvent pas traverser la frontière
 * serveur → client en propriétés.
 *
 * Sans session, on renvoie à la connexion : le paiement comme le portail
 * exigent un compte, et une grille de prix sans bouton fonctionnel existe déjà
 * sur la page d'accueil.
 */
export default async function UpgradePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [subscription, projects, usage] = await Promise.all([
    getUserSubscription(),
    listProjects(),
    checkRateLimit(user.id),
  ]);

  return (
    <UpgradeClient
      userEmail={user.email ?? ""}
      plan={subscription.plan}
      hasStripeCustomer={Boolean(subscription.stripe_customer_id)}
      projects={projects}
      usageUsed={usage.used}
      usageLimit={usage.limit}
    />
  );
}
