import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db";
import { chatToUserEntity } from "../../db/entities/chat/chat-to-users.entity";
import { chatEntity } from "db/entities/chat/chat.entity";
import { messageEntity } from "db/entities/chat/message.entity";
import {
  CHAT_NOT_FOUND,
  MESSAGES_NOT_FOUND,
  PARAMS_IS_REQUIRED,
} from "consts/response-status/response-message";
import { clients } from "../../ws/chat-ws";
import { ChatEvents } from "enums/chat/events";
const getMyChats = async (userId: string) => {
  const chatsToUser = await db
    .select()
    .from(chatToUserEntity)
    .where(eq(chatToUserEntity.userId, userId));

  const chatsToUserIds = chatsToUser
    .map((it) => it.chatId)
    .filter((i) => i !== null);

  if (!chatsToUser || chatsToUser.length === 0) {
    throw new Error(CHAT_NOT_FOUND);
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

  const chatsWithMessage = chats.map((chat) => {
    const message = messages.find((msg) => msg.chatId === chat.id) || null;
    return { ...chat, message };
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
    chat,
    chatToUser,
  };
};
const sendMessage = async (ownerId: string, text: string, chatId: string) => {
  console.log(ownerId, text, chatId, "MESSAGE ");
  const [message] = await db
    .insert(messageEntity)
    .values({
      ownerId,
      chatId,
      text,
    })
    .returning();
  console.log(message, "mESSAGE IN SEND MESSAGE");
  return message;
};
export const chatService = {
  getMyChats,
  createChat,
  sendMessage,
  getMessages,
};
