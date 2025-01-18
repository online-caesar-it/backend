import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { userEntity } from "../user/user.entity";
import { directionEntity } from "../direction/direction.entity";
import { relations } from "drizzle-orm";

export const paymentEntity = pgTable("payment", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userEntity.id),
  directionId: uuid("direction_id")
    .notNull()
    .references(() => directionEntity.id),
  payment: text("payment").notNull(),
});

export const paymentRelations = relations(paymentEntity, ({ one }) => ({
  user: one(userEntity, {
    fields: [paymentEntity.userId],
    references: [userEntity.id],
  }),
  direction: one(directionEntity, {
    fields: [paymentEntity.directionId],
    references: [directionEntity.id],
  }),
}));
