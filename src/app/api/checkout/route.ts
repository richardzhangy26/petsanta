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

export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const priceId = process.env.PRICE_ID!;
    const creditsAmount = 200;

    const existingPayment = await db.query.stripePayments.findFirst({
      where: eq(stripePayments.userId, userId),
    });

    let customerId = existingPayment?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          userId,
        },
      });
      customerId = customer.id;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        creditsAmount: creditsAmount.toString(),
      },
    });

    await db.insert(stripePayments).values({
      id: crypto.randomUUID(),
      userId,
      stripePaymentId: checkoutSession.id,
      stripeCustomerId: customerId,
      amount: 1000,
      currency: "usd",
      status: "pending",
      paymentMethod: "card",
      creditsAdded: creditsAmount,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
