import { pgTable, uuid } from "drizzle-orm/pg-core";
import { userEntity } from "../user/user.entity";
import { directionEntity } from "./direction.entity";
import { relations } from "drizzle-orm";

export const educatorsToDirectionsEntity = pgTable("educators_to_directions", {
  id: uuid("id").primaryKey().defaultRandom(),
  educatorId: uuid("educator_id")
    .notNull()
    .references(() => userEntity.id),
  directionId: uuid("direction_id")
    .notNull()
    .references(() => directionEntity.id),
});
export const educatorsToDirectionsRelations = relations(
  educatorsToDirectionsEntity,
  ({ one }) => ({
    educator: one(userEntity, {
      fields: [educatorsToDirectionsEntity.educatorId],
      references: [userEntity.id],
    }),
    direction: one(directionEntity, {
      fields: [educatorsToDirectionsEntity.directionId],
      references: [directionEntity.id],
    }),
  })
);
