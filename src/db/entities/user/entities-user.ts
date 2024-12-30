import { pgTable, serial, text, uuid } from "drizzle-orm/pg-core";

export const entitiesUser = pgTable("usersConfig", {
  id: uuid().defaultRandom().primaryKey(),
  role: text("role").notNull(),
  firstName: text("firstName"),
  secondName: text("secondName"),
  lastName: text("lastName"),
  avatar: text("avatar"),
});
