import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // @ts-expect-error - apiVersion may not be in current types
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});