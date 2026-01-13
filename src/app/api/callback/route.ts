import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { imageGenerationTasks } from "@/db/schema";
import { extractGeneratedUrls } from "@/lib/kie-ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid callback payload" },
        { status: 400 }
      );
    }

    const bodyWithData = body as { data?: unknown };
    const payload = (bodyWithData.data && typeof bodyWithData.data === "object"
      ? bodyWithData.data
      : body) as Record<string, unknown>;

    const taskId = typeof payload.taskId === "string" ? payload.taskId : null;
    const state = typeof payload.state === "string" ? payload.state : null;
    const resultJson = typeof payload.resultJson === "string" || payload.resultJson === null
      ? (payload.resultJson as string | null)
      : null;
    const failMsg = typeof payload.failMsg === "string" ? payload.failMsg : null;

    if (!taskId) {
      console.error("Missing taskId in callback:", body);
      return NextResponse.json(
        { error: "Missing taskId" },
        { status: 400 }
      );
    }

    const task = await db.query.imageGenerationTasks.findFirst({
      where: eq(imageGenerationTasks.taskId, taskId),
    });

    if (!task) {
      console.error("Task not found for Kie.ai taskId:", taskId);
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const updateData: Partial<typeof imageGenerationTasks.$inferInsert> = {
      kieResponse: body,
    };

    if (state === "success") {
      const generatedUrls = extractGeneratedUrls(resultJson);

      if (generatedUrls.length > 0) {
        try {
          const response = await fetch(generatedUrls[0]);
          const imageBuffer = Buffer.from(await response.arrayBuffer());

          const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
          if (!blobToken) {
            throw new Error("BLOB_READ_WRITE_TOKEN is not set");
          }

          const blob = await put(
            `pets-santa/generated/${task.userId}/${taskId}.png`,
            imageBuffer,
            {
              access: "public",
              token: blobToken,
              contentType: "image/png",
            }
          );

          updateData.generatedImageUrl = blob.url;
          updateData.status = "completed";
          updateData.completedAt = new Date();
        } catch (downloadError) {
          console.error("Failed to download generated image:", downloadError);
          updateData.status = "failed";
          updateData.errorMessage = "Failed to download generated image";
        }
      } else {
        updateData.status = "failed";
        updateData.errorMessage = "No generated images returned";
      }
    }
    else if (state === "fail") {
      updateData.status = "failed";
      updateData.errorMessage = failMsg || "Task failed";
    }

    await db
      .update(imageGenerationTasks)
      .set(updateData)
      .where(eq(imageGenerationTasks.id, task.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json(
      { error: "Failed to process callback" },
      { status: 500 }
    );
  }
}
