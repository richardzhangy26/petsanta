import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/db";
import { stripePayments, creditUsage } from "@/db/schema/billing";
import { user } from "@/db/schema/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [userData, payments, usageHistory] = await Promise.all([
      db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: {
          credits: true,
        },
      }),
      db.query.stripePayments.findMany({
        where: eq(stripePayments.userId, userId),
        orderBy: [desc(stripePayments.createdAt)],
      }),
      db.query.creditUsage.findMany({
        where: eq(creditUsage.userId, userId),
        orderBy: [desc(creditUsage.createdAt)],
      }),
    ]);

    return NextResponse.json({
      credits: userData?.credits || 0,
      payments,
      usageHistory,
    });
  } catch (error) {
    console.error("Billing API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing data" },
      { status: 500 }
    );
  }
}
