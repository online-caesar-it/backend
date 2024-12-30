import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const entitiesUser = pgTable("usersConfig", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  firstName: text("firstName"),
  secondName: text("secondName"),
  lastName: text("lastName"),
  avatar: text("avatar"),
});
