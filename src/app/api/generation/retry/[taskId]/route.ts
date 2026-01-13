import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/db";
import { imageGenerationTasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createKieTask } from "@/lib/kie-ai";

const MAX_RETRY_COUNT = 3;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { taskId } = await context.params;

    const task = await db.query.imageGenerationTasks.findFirst({
      where: and(
        eq(imageGenerationTasks.id, taskId),
        eq(imageGenerationTasks.userId, userId)
      ),
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    if (task.status !== "failed") {
      return NextResponse.json(
        { error: "Only failed tasks can be retried" },
        { status: 400 }
      );
    }

    if (task.retryCount >= MAX_RETRY_COUNT) {
      return NextResponse.json(
        { error: `Maximum retry count (${MAX_RETRY_COUNT}) exceeded` },
        { status: 400 }
      );
    }

    let kieTaskId: string;
    try {
      const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback`;
      kieTaskId = await createKieTask({
        model: "nano-banana-pro",
        input: {
          prompt: task.prompt,
          image_input: [task.originalImageUrl],
          aspect_ratio: task.aspectRatio,
          resolution: task.resolution,
          output_format: task.outputFormat,
        },
        callBackUrl: callbackUrl,
      });
    } catch (kieError) {
      console.error("Failed to retry Kie.ai task:", kieError);
      return NextResponse.json(
        { error: "Failed to retry task" },
        { status: 500 }
      );
    }

    await db
      .update(imageGenerationTasks)
      .set({
        taskId: kieTaskId,
        status: "waiting",
        errorMessage: null,
        retryCount: task.retryCount + 1,
        kieResponse: null,
      })
      .where(eq(imageGenerationTasks.id, taskId));

    return NextResponse.json({
      success: true,
      taskId,
      retryCount: task.retryCount + 1,
      status: "waiting",
    });
  } catch (error) {
    console.error("Retry task error:", error);
    return NextResponse.json(
      { error: "Failed to retry task" },
      { status: 500 }
    );
  }
}
