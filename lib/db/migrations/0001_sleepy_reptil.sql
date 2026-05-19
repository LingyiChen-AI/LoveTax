CREATE TYPE "public"."event_kind" AS ENUM('deduct', 'bonus');--> statement-breakpoint
ALTER TYPE "public"."email_type" ADD VALUE 'bonus';--> statement-breakpoint
ALTER TYPE "public"."email_type" ADD VALUE 'bonus_void';--> statement-breakpoint
ALTER TABLE "deductions" ADD COLUMN "kind" "event_kind" DEFAULT 'deduct' NOT NULL;--> statement-breakpoint
CREATE INDEX "deductions_couple_date_kind_idx" ON "deductions" USING btree ("couple_id","occurred_local_date","kind");