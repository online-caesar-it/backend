CREATE TABLE "users_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"email" text NOT NULL,
	"password" text NOT NULL
);
--> statement-breakpoint
DROP TABLE "usersConfig" CASCADE;--> statement-breakpoint
ALTER TABLE "users_config" ADD CONSTRAINT "users_config_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;