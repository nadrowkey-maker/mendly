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

    /*
     * Pas de client Stripe : rien à gérer côté Stripe.
     *
     * C'est le cas d'un plan attribué à la main en base, sans passage par le
     * paiement. Le code d'erreur est explicite pour que l'interface puisse le
     * dire, au lieu d'afficher « une erreur est survenue » sur un compte qui
     * fonctionne parfaitement.
     */
    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: "no_stripe_customer" }, { status: 409 });
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