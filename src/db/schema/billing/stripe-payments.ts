import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../auth";

export const stripePayments = pgTable("stripe_payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  stripePaymentId: text("stripe_payment_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull(),
  paymentMethod: text("payment_method"),
  creditsAdded: integer("credits_added").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type StripePaymentsType = typeof stripePayments.$inferSelect;
export type NewStripePaymentsType = typeof stripePayments.$inferInsert;
