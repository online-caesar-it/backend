ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "firstName" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "secondName" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lastName" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "usersConfig" ADD COLUMN "userId" uuid;--> statement-breakpoint
ALTER TABLE "usersConfig" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "usersConfig" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "usersConfig" ADD CONSTRAINT "usersConfig_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "usersConfig" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "usersConfig" DROP COLUMN "firstName";--> statement-breakpoint
ALTER TABLE "usersConfig" DROP COLUMN "secondName";--> statement-breakpoint
ALTER TABLE "usersConfig" DROP COLUMN "lastName";--> statement-breakpoint
ALTER TABLE "usersConfig" DROP COLUMN "avatar";