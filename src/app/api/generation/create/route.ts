import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/server";
import { db } from "@/db";
import { imageGenerationTasks, creditUsage } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { createKieTask } from "@/lib/kie-ai";

export const runtime = "nodejs";

const CREDITS_PER_GENERATION = 20;

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("originalImageUrl" in body) ||
      !("style" in body) ||
      !("prompt" in body)
    ) {
      return NextResponse.json(
        { error: "Missing required fields: originalImageUrl, style, prompt" },
        { status: 400 }
      );
    }

    const { originalImageUrl, style, prompt, aspectRatio = "1:1", resolution = "1K" } =
      body as {
        originalImageUrl: unknown;
        style: unknown;
        prompt: unknown;
        aspectRatio?: unknown;
        resolution?: unknown;
      };

    if (
      typeof originalImageUrl !== "string" ||
      typeof style !== "string" ||
      typeof prompt !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const normalizedAspectRatio = typeof aspectRatio === "string" ? aspectRatio : "1:1";
    const normalizedResolution = typeof resolution === "string" ? resolution : "1K";

    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { credits: true },
    });

    if (!userData || userData.credits < CREDITS_PER_GENERATION) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          required: CREDITS_PER_GENERATION,
          current: userData?.credits || 0,
        },
        { status: 400 }
      );
    }

    const taskId = crypto.randomUUID();
    const placeholderKieTaskId = crypto.randomUUID();
    const newRemainingCredits = userData.credits - CREDITS_PER_GENERATION;

    await db.transaction(async (tx) => {
      await tx
        .update(user)
        .set({ credits: newRemainingCredits })
        .where(eq(user.id, userId));

      await tx.insert(creditUsage).values({
        id: crypto.randomUUID(),
        userId,
        creditsUsed: CREDITS_PER_GENERATION,
        remainingCredits: newRemainingCredits,
        description: `Image generation: ${style}`,
      });

      await tx.insert(imageGenerationTasks).values({
        id: taskId,
        userId,
        taskId: placeholderKieTaskId,
        originalImageUrl,
        prompt,
        style,
        aspectRatio: normalizedAspectRatio,
        resolution: normalizedResolution,
        outputFormat: "png",
        status: "waiting",
        creditsUsed: CREDITS_PER_GENERATION,
      });
    });

    let kieTaskId: string;
    try {
      const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback`;
      kieTaskId = await createKieTask({
        model: "nano-banana-pro",
        input: {
          prompt,
          image_input: [originalImageUrl],
          aspect_ratio: normalizedAspectRatio,
          resolution: normalizedResolution,
          output_format: "png",
        },
        callBackUrl: callbackUrl,
      });

      await db
        .update(imageGenerationTasks)
        .set({ taskId: kieTaskId })
        .where(eq(imageGenerationTasks.id, taskId));
    } catch (kieError) {
      console.error("Failed to create Kie.ai task:", kieError);

      await db
        .update(imageGenerationTasks)
        .set({
          status: "failed",
          errorMessage: "Failed to create task with Kie.ai",
          kieResponse: { error: String(kieError) },
        })
        .where(eq(imageGenerationTasks.id, taskId));

      return NextResponse.json(
        { error: "Failed to create generation task" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: taskId,
      status: "waiting",
      creditsRemaining: newRemainingCredits,
    });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Failed to create generation task" },
      { status: 500 }
    );
  }
}
