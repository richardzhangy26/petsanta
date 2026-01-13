import { integer, pgTable, text, timestamp, json, index } from "drizzle-orm/pg-core";
import { user } from "../auth";
import { sql } from "drizzle-orm";

export const imageGenerationTasks = pgTable("image_generation_tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  taskId: text("task_id").notNull().unique(), // Kie.ai 任务ID

  // 图片 URLs
  originalImageUrl: text("original_image_url").notNull(),
  generatedImageUrl: text("generated_image_url"),

  // 生图参数
  prompt: text("prompt").notNull(),
  style: text("style").notNull(),
  aspectRatio: text("aspect_ratio").notNull().default("1:1"),
  resolution: text("resolution").notNull().default("1K"),
  outputFormat: text("output_format").notNull().default("png"),

  // 状态管理
  status: text("status").notNull().default("waiting"), // waiting, processing, completed, failed
  creditsUsed: integer("credits_used").notNull().default(20),
  errorMessage: text("error_message"),

  // Kie.ai 响应数据
  kieResponse: json("kie_response"),

  // 重试计数
  retryCount: integer("retry_count").notNull().default(0),

  // 时间戳
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdIdx: index("idx_user_id").on(table.userId),
  taskIdIdx: index("idx_task_id").on(table.taskId),
  statusIdx: index("idx_status").on(table.status),
  createdAtIdx: index("idx_created_at").on(table.createdAt),
}));

export type ImageGenerationTaskType = typeof imageGenerationTasks.$inferSelect;
export type NewImageGenerationTaskType = typeof imageGenerationTasks.$inferInsert;
