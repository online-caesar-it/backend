import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const entitiesUser = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull(),
});
