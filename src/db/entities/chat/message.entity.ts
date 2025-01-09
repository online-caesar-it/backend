import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { userEntity } from "../user/user.entity";
import { relations } from "drizzle-orm";
import { chatEntity } from "./chat.entity";

export const messageEntity = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("ownerId").references(() => userEntity.id),
  chatId: uuid("chatId").references(() => chatEntity.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messageEntity, ({ one }) => ({
  owner: one(userEntity, {
    fields: [messageEntity.ownerId],
    references: [userEntity.id],
  }),
  chat: one(chatEntity, {
    fields: [messageEntity.chatId],
    references: [chatEntity.id],
  }),
}));
