import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

export const runtime = "nodejs";

/**
 * Creates a Stripe Customer Portal session for the current user.
 * Used to manage/cancel subscription, change payment method, etc.
 */
export async function POST(req: NextRequest) {
  try {
    const { locale = "fr" } = (await req.json().catch(() => ({}))) as {
      locale?: string;
    };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 404 }
      );
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";
    const returnUrl = `${origin}/${locale}/dashboard`;

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Portal error:", err);
    return NextResponse.json(
      { error: "Could not create portal session" },
      { status: 500 }
    );
  }
}