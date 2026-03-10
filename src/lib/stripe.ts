import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string
) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
    },
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/register?canceled=true`,
  });

  return session;
}

export async function createPortalSession(customerId: string) {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  });

  return session;
}
