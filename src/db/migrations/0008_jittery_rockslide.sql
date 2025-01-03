ALTER TABLE "users_config" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users_config" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users_config" ADD COLUMN "phone_number" text;