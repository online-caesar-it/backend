import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userEntity } from "../user/user.entity";
import { groupEntity } from "../group/group.entity";
import { moduleEntity } from "../module/module.entity";
import { paymentEntity } from "../payment/payment.entity";

export const directionEntity = pgTable("direction", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
});

export const directionsToGroupsEntity = pgTable("directions_to_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  directionId: uuid("direction_id")
    .notNull()
    .references(() => directionEntity.id),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groupEntity.id),
});

export const directionGroupsRelations = relations(
  directionEntity,
  ({ many }) => ({
    groups: many(directionsToGroupsEntity),
    modules: many(moduleEntity),
  })
);

export const directionsToGroupsRelations = relations(
  directionsToGroupsEntity,
  ({ one }) => ({
    direction: one(directionEntity, {
      fields: [directionsToGroupsEntity.directionId],
      references: [directionEntity.id],
    }),
    group: one(groupEntity, {
      fields: [directionsToGroupsEntity.groupId],
      references: [groupEntity.id],
    }),
  })
);

export const directionPaymentRelations = relations(
  directionEntity,
  ({ many }) => ({
    payments: many(paymentEntity),
  })
);
