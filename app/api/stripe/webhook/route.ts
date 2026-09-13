import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { getPlanFromPriceId } from "@/lib/stripe/plans";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Le webhook Stripe — le seul endroit où un paiement devient un avantage.
 *
 * Trois défauts corrigés par rapport à la version précédente, et chacun
 * pouvait laisser un client payer sans rien débloquer :
 *
 * 1. Les écritures en base n'étaient pas vérifiées. Si l'upsert échouait, la
 *    route répondait quand même 200 : Stripe considérait l'événement comme
 *    livré et ne le renvoyait jamais. Le client avait payé, son plan restait
 *    gratuit, et rien ne le signalait. Une écriture ratée répond maintenant
 *    500, et Stripe réessaie.
 *
 * 2. Les événements de mise à jour étaient appliqués tels quels. Stripe ne
 *    garantit pas l'ordre de livraison : un ancien `subscription.updated`
 *    arrivé après un récent pouvait ramener un plan à son état précédent. On
 *    relit donc l'abonnement à la source avant d'écrire.
 *
 * 3. La fin de période était lue sur l'abonnement, où les versions récentes
 *    de l'API ne la placent plus (elle est passée sur l'élément d'abonnement).
 *    Selon la version du point de terminaison, elle était donc toujours vide.
 */

/** Client à clé de service : le webhook écrit sans passer par les règles d'accès. */
function getAdminSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** L'identifiant Stripe, que le champ soit développé en objet ou non. */
function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** Fin de période : sur l'abonnement (anciennes API) ou sur son élément (récentes). */
function periodEnd(sub: Stripe.Subscription): string | null {
  const onSub = (sub as unknown as { current_period_end?: number }).current_period_end;
  const onItem = (sub.items.data[0] as unknown as { current_period_end?: number } | undefined)
    ?.current_period_end;
  const seconds = onSub ?? onItem;
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

/** Retrouve l'utilisateur par son client Stripe, quand les métadonnées manquent. */
async function userForCustomer(
  supabase: SupabaseClient,
  customerId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (error) throw new Error(`lookup by customer failed: ${error.message}`);
  return (data?.user_id as string | undefined) ?? null;
}

/** Écrit l'état d'un abonnement Stripe sur la ligne de l'utilisateur. */
async function writeSubscription(
  supabase: SupabaseClient,
  userId: string,
  sub: Stripe.Subscription
): Promise<void> {
  const priceId = sub.items.data[0]?.price.id ?? null;
  const plan = priceId ? getPlanFromPriceId(priceId) : null;

  // Un prix inconnu n'est pas une panne passagère : le renvoyer ne changerait
  // rien. On journalise et on accepte l'événement, sans quoi Stripe le
  // réessaierait pendant trois jours.
  if (!plan) {
    console.error(`[webhook] prix inconnu "${priceId}" pour l'abonnement ${sub.id} — plan non modifié`);
    return;
  }

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan,
      status: sub.status,
      stripe_customer_id: idOf(sub.customer),
      stripe_subscription_id: sub.id,
      stripe_price_id: priceId,
      current_period_end: periodEnd(sub),
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(`subscriptions upsert failed: ${error.message}`);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature/secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const subscriptionId = idOf(session.subscription);
        if (!userId || !subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await writeSubscription(supabase, userId, sub);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const payload = event.data.object as Stripe.Subscription;
        // L'état à la source, pas celui de l'événement : voir le point 2.
        const sub = await stripe.subscriptions.retrieve(payload.id);

        const customerId = idOf(sub.customer);
        const userId =
          (sub.metadata?.supabase_user_id as string | undefined) ??
          (customerId ? await userForCustomer(supabase, customerId) : null);

        if (!userId) {
          console.error(`[webhook] abonnement ${sub.id} sans utilisateur rattachable — ignoré`);
          break;
        }
        await writeSubscription(supabase, userId, sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = idOf(sub.customer);
        const userId = customerId ? await userForCustomer(supabase, customerId) : null;
        if (!userId) break;

        const { error } = await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            status: "canceled",
            stripe_subscription_id: null,
            stripe_price_id: null,
            current_period_end: null,
            cancel_at_period_end: false,
          })
          .eq("user_id", userId);
        if (error) throw new Error(`subscriptions downgrade failed: ${error.message}`);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // 500 : Stripe renverra l'événement. C'est exactement ce qu'on veut quand
    // une écriture a échoué — voir le point 1.
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
