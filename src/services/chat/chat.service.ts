import { chatToUserEntity } from "./../../db/entities/chat/chat-to-users.entity";
import { desc, eq, inArray, and, notInArray, sql } from "drizzle-orm";
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

  const chatsWithMessage = [];

  for (const chat of chats) {
    const chatUsers = await db
      .select()
      .from(chatToUserEntity)
      .where(eq(chatToUserEntity.chatId, chat.id));

    const chatUserIds = chatUsers
      .map((it) => it.userId)
      .filter((id) => id !== null);

    const interlocutors = await db
      .select()
      .from(userEntity)
      .where(notInArray(userEntity.id, [userId]));

    const message = messages.find((msg) => msg.chatId === chat.id) || null;

    chatsWithMessage.push({
      ...chat,
      message,
      interlocutors,
    });
  }

  return chatsWithMessage;
};

const getMessages = async (
  chatId: string,
  cursor: number = 0,
  limit: number = 10,
  offset: number = 0
) => {
  if (!chatId || !cursor || !limit) {
    throw new Error(PARAMS_IS_REQUIRED);
  }
  const messages = await db.query.messageEntity.findMany({
    where: (it) => eq(it.chatId, chatId),
    limit,
    offset: limit * cursor + offset,
    extras: {
      full_count: sql<string>`COUNT(*) OVER()`.as("full_count"),
    },
    orderBy: (it) => desc(it.createdAt),
  });
  const owner = await db.query.userEntity.findFirst({
    where: (it) =>
      inArray(
        it.id,
        messages.map((item) => item.ownerId).filter((k) => k !== null)
      ),
  });
  const messagesWithOwners = messages.map((message) => {
    return {
      ...message,
      owner,
    };
  });
  const totalItems = parseInt(messages[0]?.full_count) ?? 0;
  const nextCursor = totalItems > limit * cursor + offset ? cursor + 1 : null;
  return {
    items: messagesWithOwners,
    nextCursor,
  };
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
  for (let user of userIds) {
    await db.insert(chatToUserEntity).values({
      userId: user,
      chatId: chat.id,
    });
  }
  return chat;
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

  const owner = await db.query.userEntity.findFirst({
    where: eq(userEntity.id, message.ownerId || ""),
  });

  return {
    ...message,
    owner,
  };
};
export const chatService = {
  getMyChats,
  createChat,
  sendMessage,
  getMessages,
};
