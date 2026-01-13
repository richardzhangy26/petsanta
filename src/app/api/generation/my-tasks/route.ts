import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/db";
import { imageGenerationTasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const tasks = await db.query.imageGenerationTasks.findMany({
      where: eq(imageGenerationTasks.userId, userId),
      orderBy: [desc(imageGenerationTasks.createdAt)],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Get my tasks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
