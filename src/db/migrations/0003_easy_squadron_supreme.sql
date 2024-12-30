CREATE TABLE "usersConfig" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"firstName" text,
	"secondName" text,
	"lastName" text,
	"avatar" text
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "userId" integer PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role";