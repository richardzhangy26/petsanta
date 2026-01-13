import { NextResponse } from "next/server";
import { db } from "@/db";
import { imageGenerationTasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { extractGeneratedUrls } from "@/lib/kie-ai";
import { put } from "@vercel/blob/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { taskId, state, resultJson, failMsg } = body.data || body;

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

    let updateData: any = {
      kieResponse: body,
    };

    if (state === "success") {
      const generatedUrls = extractGeneratedUrls(resultJson);

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
            `pets-santa/generated/${task.userId}/${taskId}.png`,
            imageBlob,
            {
              access: 'public',
              token: blobToken,
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
