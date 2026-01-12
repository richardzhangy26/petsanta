import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { stripePayments, creditUsage } from "@/db/schema/billing";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const creditsAmount = parseInt(session.metadata?.creditsAmount || "0");

    if (!userId || creditsAmount === 0) {
      console.error("Missing metadata:", { userId, creditsAmount });
      return NextResponse.json(
        { error: "Missing required metadata" },
        { status: 400 }
      );
    }

    try {
      await db.transaction(async (tx) => {
        const userData = await tx.query.user.findFirst({
          where: eq(user.id, userId),
        });

        if (!userData) {
          throw new Error("User not found");
        }

        const currentCredits = userData.credits || 0;
        const newCredits = currentCredits + creditsAmount;

        await tx
          .update(user)
          .set({ credits: newCredits })
          .where(eq(user.id, userId));

        await tx
          .update(stripePayments)
          .set({ status: "completed" })
          .where(eq(stripePayments.stripePaymentId, session.id));

        await tx.insert(creditUsage).values({
          id: crypto.randomUUID(),
          userId,
          creditsUsed: 0,
          remainingCredits: newCredits,
          description: `Purchase: ${creditsAmount} credits`,
        });
      });

      console.log(`Successfully added ${creditsAmount} credits to user ${userId}`);
    } catch (error) {
      console.error("Error processing payment:", error);
      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
