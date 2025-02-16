import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { groupEntity } from "../group/group.entity";
import { relations } from "drizzle-orm/relations";
import { paymentEntity } from "../payment/payment.entity";
import { userConfigEntity } from "./user-config.entity";

export const userEntity = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  role: text("role").notNull(),
  firstName: text("firstName"),
  surname: text("surname"),
  patronymic: text("patronymic"),
  avatar: text("avatar"),
  groupId: uuid("groupId"),
});

export const userGroupRelations = relations(userEntity, ({ one }) => ({
  group: one(groupEntity, {
    fields: [userEntity.groupId],
    references: [groupEntity.id],
  }),
}));
export const userPaymentRelations = relations(userEntity, ({ many }) => ({
  payments: many(paymentEntity),
}));
export const userRelations = relations(userEntity, ({ one }) => ({
  config: one(userConfigEntity, {
    fields: [userEntity.id],
    references: [userConfigEntity.userId],
  }),
}));
