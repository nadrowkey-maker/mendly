import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { getPlanFromPriceId, type PlanTier } from "@/lib/stripe/plans";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Service-role Supabase client for webhook DB writes (bypasses RLS).
 */
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
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
        const subscriptionId = session.subscription as string | null;
        const customerId = session.customer as string;

        if (!userId || !subscriptionId) break;

        // Fetch the full subscription to get price + period
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const resolvedPlan = priceId ? getPlanFromPriceId(priceId) : null;
        if (!resolvedPlan) {
          console.error(`[webhook] checkout.session.completed: unknown priceId "${priceId}" for user ${userId} — skipping plan update`);
          break;
        }
        const plan: PlanTier = resolvedPlan;

        await supabase
          .from("subscriptions")
          .upsert(
            {
              user_id: userId,
              plan,
              status: subscription.status,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: priceId ?? null,
              // @ts-expect-error - current_period_end exists on Stripe sub
              current_period_end: subscription.current_period_end
                ? new Date(
                    // @ts-expect-error
                    subscription.current_period_end * 1000
                  ).toISOString()
                : null,
              cancel_at_period_end: subscription.cancel_at_period_end ?? false,
            },
            { onConflict: "user_id" }
          );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          (sub.metadata?.supabase_user_id as string | undefined) ?? null;
        const customerId = sub.customer as string;
        const priceId = sub.items.data[0]?.price.id;
        const resolvedPlan2 = priceId ? getPlanFromPriceId(priceId) : null;
        if (!resolvedPlan2) {
          console.error(`[webhook] subscription.updated/created: unknown priceId "${priceId}" — skipping plan update`);
          break;
        }
        const plan: PlanTier = resolvedPlan2;

        // If we don't have the userId in metadata, look it up by customer
        let resolvedUserId = userId;
        if (!resolvedUserId) {
          const { data } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          resolvedUserId = data?.user_id ?? null;
        }
        if (!resolvedUserId) break;

        await supabase.from("subscriptions").upsert(
          {
            user_id: resolvedUserId,
            plan,
            status: sub.status,
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
            stripe_price_id: priceId ?? null,
            // @ts-expect-error
            current_period_end: sub.current_period_end
              ? // @ts-expect-error
                new Date(sub.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
          },
          { onConflict: "user_id" }
        );
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const { data } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        if (!data?.user_id) break;

        await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            status: "canceled",
            stripe_subscription_id: null,
            stripe_price_id: null,
            cancel_at_period_end: false,
          })
          .eq("user_id", data.user_id);
        break;
      }

      default:
        // Unhandled event types — fine to ignore
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}