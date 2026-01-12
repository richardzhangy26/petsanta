import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth/server";
import { db } from "@/db";
import { stripePayments } from "@/db/schema/billing";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const CONFIG = {
  PRICE_ID: process.env.PRICE_ID!,
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
  CREDITS_AMOUNT: 200,
  PAYMENT_AMOUNT: 1000,
  CURRENCY: "usd",
} as const;

async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const existingPayment = await db.query.stripePayments.findFirst({
    where: eq(stripePayments.userId, userId),
  });

  if (existingPayment?.stripeCustomerId) {
    return existingPayment.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    metadata: { userId },
  });

  return customer.id;
}

async function createCheckoutSession(
  customerId: string,
  userId: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: CONFIG.PRICE_ID, quantity: 1 }],
    mode: "payment",
    success_url: `${CONFIG.BASE_URL}/billing?success=true`,
    cancel_url: `${CONFIG.BASE_URL}/pricing?canceled=true`,
    metadata: {
      userId,
      creditsAmount: CONFIG.CREDITS_AMOUNT.toString(),
    },
  });
}

async function recordPayment(
  checkoutSession: Stripe.Checkout.Session,
  userId: string,
  customerId: string
): Promise<void> {
  await db.insert(stripePayments).values({
    id: crypto.randomUUID(),
    userId,
    stripePaymentId: checkoutSession.id,
    stripeCustomerId: customerId,
    amount: CONFIG.PAYMENT_AMOUNT,
    currency: CONFIG.CURRENCY,
    status: "pending",
    paymentMethod: "card",
    creditsAdded: CONFIG.CREDITS_AMOUNT,
  });
}

export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const customerId = await getOrCreateStripeCustomer(userId);
    const checkoutSession = await createCheckoutSession(customerId, userId);

    await recordPayment(checkoutSession, userId, customerId);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
