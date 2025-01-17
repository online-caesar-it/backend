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
    .references(() => directionEntity.id)
    .notNull(),
  payment: text("payment").notNull(),
});

export const paymentRelations = relations(paymentEntity, ({ one }) => ({
  user: one(userEntity),
  direction: one(directionEntity),
}));
