import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { directionEntity } from "../direction/direction.entity";
import { relations } from "drizzle-orm";
import { lessonEntity } from "../lesson/lesson.entity";

export const moduleEntity = pgTable("module", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  directionId: uuid("direction_id")
    .references(() => directionEntity.id)
    .notNull(),
});
export const moduleRelations = relations(moduleEntity, ({ one, many }) => ({
  direction: one(directionEntity, {
    fields: [moduleEntity.directionId],
    references: [directionEntity.id],
  }),
  lessons: many(lessonEntity),
}));
