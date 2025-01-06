import { json, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const logEntity = pgTable("logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tag: text("name").notNull(),
  type: text("type").notNull(),
  obj: json("obj").notNull(),
});
