import { integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { userEntity } from "../user/user.entity";
import { directionEntity } from "./direction.entity";
import { relations } from "drizzle-orm";

export const userToDirectionEntity = pgTable("user_to_direction", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userEntity.id),
  directionId: uuid("direction_id")
    .notNull()
    .references(() => directionEntity.id),
  availableLessonCount: integer("available_lesson_count"),
});
export const userToDirectionsRelations = relations(
  userToDirectionEntity,
  ({ one }) => ({
    user: one(userEntity, {
      fields: [userToDirectionEntity.userId],
      references: [userEntity.id],
    }),
    direction: one(directionEntity, {
      fields: [userToDirectionEntity.directionId],
      references: [directionEntity.id],
    }),
  })
);
