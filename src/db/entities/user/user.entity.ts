import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const userEntity = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  role: text("role").notNull(),
  firstName: text("firstName"),
  surname: text("surname"),
  patronymic: text("patronymic"),
  avatar: text("avatar"),
});
