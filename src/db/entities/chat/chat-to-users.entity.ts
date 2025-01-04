import { pgTable, uuid } from "drizzle-orm/pg-core";
import { userEntity } from "../user/user.entity";
import { chatEntity } from "./chat.entity";

export const chatToUserEntity = pgTable("chat_to_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId").references(() => userEntity.id),
  chatId: uuid("chatId").references(() => chatEntity.id),
});
