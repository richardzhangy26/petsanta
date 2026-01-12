import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../auth";

export const creditUsage = pgTable("credit_usage", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  creditsUsed: integer("credits_used").notNull(),
  remainingCredits: integer("remaining_credits").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type CreditUsageType = typeof creditUsage.$inferSelect;
export type NewCreditUsageType = typeof creditUsage.$inferInsert;
