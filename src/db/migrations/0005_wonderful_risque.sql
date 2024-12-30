ALTER TABLE "users" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "usersConfig" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "usersConfig" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();