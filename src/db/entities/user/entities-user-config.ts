import { pgTable, serial, text, uuid } from "drizzle-orm/pg-core";

export const entitiesUserConfig = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: uuid("userId"),
  email: text("email").notNull(),
  password: text("password").notNull(),
});
