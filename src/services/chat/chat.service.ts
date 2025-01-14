import { chatToUserEntity } from "./../../db/entities/chat/chat-to-users.entity";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db";
import { chatEntity } from "db/entities/chat/chat.entity";
import { messageEntity } from "db/entities/chat/message.entity";
import {
  MESSAGES_NOT_FOUND,
  PARAMS_IS_REQUIRED,
} from "consts/response-status/response-message";
import { userEntity } from "db/entities/user/user.entity";
const getMyChats = async (userId: string) => {
  const chatsToUser = await db
    .select()
    .from(chatToUserEntity)
    .where(eq(chatToUserEntity.userId, userId));

  const chatsToUserIds = chatsToUser
    .map((it) => it.chatId)
    .filter((i) => i !== null);

  if (!chatsToUser || chatsToUser.length === 0) {
    return [];
  }
  const chats = await db
    .select()
    .from(chatEntity)
    .where(inArray(chatEntity.id, chatsToUserIds));
  const chatIds = chats.map((it) => it.id);
  const messages = await db
    .select()
    .from(messageEntity)
    .where(inArray(messageEntity.chatId, chatIds))
    .limit(1)
    .orderBy(desc(messageEntity.createdAt));
  const chatUserIds = chatsToUser
    .map((it) => it.userId)
    .filter((i) => i !== null);
  const interlocutors = await db
    .select()
    .from(userEntity)
    .where(inArray(userEntity.id, chatUserIds));
  const chatsWithMessage = chats.map((chat) => {
    const message = messages.find((msg) => msg.chatId === chat.id) || null;
    return { ...chat, message, interlocutors };
  });

  return chatsWithMessage;
};

const getMessages = async (
  chatId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  const offset = (page - 1) * pageSize;
  if (!chatId || !page || !pageSize) {
    throw new Error(PARAMS_IS_REQUIRED);
  }
  const messages = await db
    .select()
    .from(messageEntity)
    .where(eq(messageEntity.chatId, chatId))
    .limit(pageSize)
    .offset(offset);
  if (!messages) {
    throw new Error(MESSAGES_NOT_FOUND);
  }
  return messages;
};

const createChat = async (
  userIds: string[],
  name: string,
  description?: string
) => {
  const [chat] = await db
    .insert(chatEntity)
    .values({
      name,
      description,
    })
    .returning();
  const [chatToUser] = await db.insert(chatToUserEntity).values({
    userId: userIds.map((id) => id).find((item) => item),
    chatId: chat.id,
  });
  return {
    ...chat,
    chatToUser,
  };
};
const sendMessage = async (ownerId: string, text: string, chatId: string) => {
  const [message] = await db
    .insert(messageEntity)
    .values({
      ownerId,
      chatId,
      text,
    })
    .returning();
  return message;
};
export const chatService = {
  getMyChats,
  createChat,
  sendMessage,
  getMessages,
};
