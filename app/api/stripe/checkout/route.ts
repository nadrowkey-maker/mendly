import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { PLANS, type PlanTier } from "@/lib/stripe/plans";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { plan, locale = "fr" } = (await req.json()) as {
      plan: PlanTier;
      locale?: string;
    };

    const planConfig = PLANS[plan];
    if (!planConfig || !planConfig.priceId) {
      return NextResponse.json(
        { error: "Invalid or unavailable plan" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create the customer in Stripe
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = existing?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Build URLs
    const origin = req.headers.get("origin") ?? "http://localhost:3000";
    const successUrl = `${origin}/${locale}/dashboard?upgrade=success`;
    const cancelUrl = `${origin}/${locale}/upgrade?canceled=true`;

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}