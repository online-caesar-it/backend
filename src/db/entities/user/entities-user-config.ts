import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { entitiesUser } from "./entities-user";

export const entitiesUserConfig = pgTable("users_config", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid().references(() => entitiesUser.id),
  email: text("email").notNull(),
  password: text("password").notNull(),
});
