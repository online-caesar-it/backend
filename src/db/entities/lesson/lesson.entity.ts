import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { moduleEntity } from "../module/module.entity";
import { relations } from "drizzle-orm";

export const lessonEntity = pgTable("lesson", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  moduleId: uuid("module_id")
    .references(() => moduleEntity.id)
    .notNull(),
  description: text("description").notNull(),
});

export const lessonRelations = relations(lessonEntity, ({ one }) => ({
  module: one(moduleEntity, {
    fields: [lessonEntity.moduleId],
    references: [moduleEntity.id],
  }),
}));
