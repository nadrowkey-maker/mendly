import Stripe from "stripe";

/**
 * Le client Stripe est construit à la première utilisation, pas au chargement
 * du module.
 *
 * Même défaut que gemini.ts avant correction : l'erreur levée à l'import
 * faisait échouer la collecte de pages au build entier, et mettait en 500 des
 * routes qui n'appellent jamais Stripe. Une clé manquante doit casser les
 * appels de paiement, rien d'autre.
 */
let cached: Stripe | null = null;

function client(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  cached ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    // @ts-expect-error - apiVersion may not be in current types
    apiVersion: "2024-12-18.acacia",
    typescript: true,
  });
  return cached;
}

/**
 * Exposé via un proxy pour garder la forme d'appel historique
 * (`stripe.checkout.sessions.create(...)`) sans toucher aux appelants.
 */
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const instance = client();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
