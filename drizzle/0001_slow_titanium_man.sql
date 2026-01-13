CREATE TABLE "image_generation_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"task_id" text NOT NULL,
	"original_image_url" text NOT NULL,
	"generated_image_url" text,
	"prompt" text NOT NULL,
	"style" text NOT NULL,
	"aspect_ratio" text DEFAULT '1:1' NOT NULL,
	"resolution" text DEFAULT '1K' NOT NULL,
	"output_format" text DEFAULT 'png' NOT NULL,
	"status" text DEFAULT 'waiting' NOT NULL,
	"credits_used" integer DEFAULT 20 NOT NULL,
	"error_message" text,
	"kie_response" json,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	CONSTRAINT "image_generation_tasks_task_id_unique" UNIQUE("task_id")
);
--> statement-breakpoint
ALTER TABLE "image_generation_tasks" ADD CONSTRAINT "image_generation_tasks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_id" ON "image_generation_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_task_id" ON "image_generation_tasks" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_status" ON "image_generation_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_created_at" ON "image_generation_tasks" USING btree ("created_at");