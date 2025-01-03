import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { entitiesUser } from "./entities-user";

export const entitiesUserConfig = pgTable("users_config", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid().references(() => entitiesUser.id),
  email: text("email"),
  password: text("password"),
  phone_number: text("phone_number"),
});
