import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const chatEntity = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  description: text("description"),
  type: text("type"),
});
