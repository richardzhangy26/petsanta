import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/db";
import { imageGenerationTasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getKieTaskStatus, extractGeneratedUrls } from "@/lib/kie-ai";
import { put } from "@vercel/blob/client";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "Missing taskId parameter" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

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

    if (task.status === "completed" || task.status === "failed") {
      return NextResponse.json(task);
    }

    if (!task.taskId) {
      return NextResponse.json({
        ...task,
        status: "waiting",
      });
    }

    try {
      const kieResponse = await getKieTaskStatus(task.taskId);
      const kieState = kieResponse.data.state;

      let newStatus: string = task.status;
      let newGeneratedImageUrl: string | null = task.generatedImageUrl;
      let newErrorMessage: string | null = task.errorMessage;
      let newCompletedAt: Date | null = task.completedAt;

      if (kieState === "success") {
          const generatedUrls = extractGeneratedUrls(kieResponse.data.resultJson);

        if (generatedUrls.length > 0) {
          try {
            const response = await fetch(generatedUrls[0]);
            const imageBuffer = Buffer.from(await response.arrayBuffer());
            const imageBlob = new Blob([imageBuffer], { type: 'image/png' });

            const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
            if (!blobToken) {
              throw new Error("BLOB_READ_WRITE_TOKEN is not set");
            }

            const blob = await put(
              `pets-santa/generated/${userId}/${task.taskId}.png`,
              imageBlob,
              {
                access: 'public',
                token: blobToken,
              }
            );

            newGeneratedImageUrl = blob.url;
            newStatus = "completed";
            newCompletedAt = new Date();
          } catch (downloadError) {
            console.error("Failed to download generated image:", downloadError);
            newStatus = "failed";
            newErrorMessage = "Failed to download generated image";
          }
        } else {
          newStatus = "failed";
          newErrorMessage = "No generated images returned";
        }
      }
      else if (kieState === "fail") {
        newStatus = "failed";
        newErrorMessage = kieResponse.data.failMsg ?? "Task failed";
      }
      else {
        newStatus = "processing";
      }

      await db
        .update(imageGenerationTasks)
        .set({
          status: newStatus,
          generatedImageUrl: newGeneratedImageUrl,
          errorMessage: newErrorMessage,
          kieResponse: kieResponse.data as any,
          completedAt: newCompletedAt,
        })
        .where(eq(imageGenerationTasks.id, taskId));

      const updatedTask = await db.query.imageGenerationTasks.findFirst({
        where: eq(imageGenerationTasks.id, taskId),
      });

      return NextResponse.json(updatedTask);
    } catch (kieError) {
      console.error("Failed to poll Kie.ai status:", kieError);

      return NextResponse.json({
        ...task,
        status: "processing",
      });
    }
  } catch (error) {
    console.error("Get task status error:", error);
    return NextResponse.json(
      { error: "Failed to get task status" },
      { status: 500 }
    );
  }
}
