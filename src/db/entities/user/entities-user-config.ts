import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const entitiesUserConfig = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  email: text("email").notNull(),
  password: text("password").notNull(),
});
