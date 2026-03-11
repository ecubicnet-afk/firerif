import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId) {
          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              stripePriceId: process.env.STRIPE_PRICE_ID,
              status: "ACTIVE",
              currentPeriodStart: new Date(),
            },
            update: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              status: "ACTIVE",
              currentPeriodStart: new Date(),
            },
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as unknown as { subscription: string }).subscription;

        if (subscriptionId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: {
              status: "ACTIVE",
              currentPeriodStart: new Date(
                (invoice.lines.data[0]?.period?.start ?? 0) * 1000
              ),
              currentPeriodEnd: new Date(
                (invoice.lines.data[0]?.period?.end ?? 0) * 1000
              ),
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as unknown as { subscription: string }).subscription;

        if (subscriptionId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: "PAST_DUE" },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as unknown as Record<string, unknown>;

        const statusMap: Record<string, "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING"> = {
          active: "ACTIVE",
          past_due: "PAST_DUE",
          canceled: "CANCELED",
          trialing: "TRIALING",
        };

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id as string },
          data: {
            status: statusMap[sub.status as string] ?? "INACTIVE",
            cancelAtPeriodEnd: (sub.cancel_at_period_end as boolean) ?? false,
            currentPeriodEnd: new Date(
              ((sub.current_period_end as number) ?? 0) * 1000
            ),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as unknown as Record<string, unknown>;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: deletedSub.id as string },
          data: { status: "CANCELED" },
        });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
