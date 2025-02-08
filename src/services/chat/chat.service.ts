import { chatToUserEntity } from "./../../db/entities/chat/chat-to-users.entity";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "../../db";
import { chatEntity } from "db/entities/chat/chat.entity";
import { messageEntity } from "db/entities/chat/message.entity";
import { PARAMS_IS_REQUIRED } from "consts/response-status/response-message";
import { userEntity } from "db/entities/user/user.entity";
import { ChatType } from "enums/chat/events";
import { IChatDto, IMessageDto } from "dto/chat-dto";
const getMyChats = async (userId: string, search: string = "") => {
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
      .where(
        and(
          inArray(userEntity.id, chatUserIds),
          search
            ? or(
                sql`LOWER(${
                  userEntity.firstName
                }) LIKE LOWER(${`%${search}%`})`,
                sql`LOWER(${userEntity.surname}) LIKE LOWER(${`%${search}%`})`
              )
            : undefined
        )
      );

    const message = messages.find((msg) => msg.chatId === chat.id) || null;

    if (interlocutors.length > 0) {
      chatsWithMessage.push({
        ...chat,
        message,
        interlocutors: interlocutors.filter((it) => it.id !== userId),
      });
    }
  }

  return chatsWithMessage;
};

const getMessages = async (
  chatId: string,
  cursor: number | string = 0,
  limit: number = 10,
  offset: number = 0
) => {
  if (!chatId) {
    throw new Error(PARAMS_IS_REQUIRED);
  }

  cursor = Number(cursor) || 0;

  const currentOffset = limit * cursor;
  const messages = await db.query.messageEntity.findMany({
    where: (it) => eq(it.chatId, chatId),
    limit,
    offset: currentOffset,
    extras: {
      full_count: sql<string>`COUNT(*) OVER()`.as("full_count"),
    },
    orderBy: (it) => desc(it.createdAt),
  });

  const totalItems = parseInt(messages[0]?.full_count || "0", 10);
  const interlocutor = await db.query.userEntity.findFirst({
    where: (it) =>
      inArray(
        it.id,
        messages.map((item) => item.ownerId).filter((k) => k !== null)
      ),
  });
  const messagesWithOwners = messages.map((message) => {
    return {
      ...message,
      interlocutor,
    };
  });
  const nextCursor = totalItems > currentOffset + limit ? cursor + 1 : null;

  return {
    items: messagesWithOwners,
    nextCursor,
  };
};

const createChat = async (data: IChatDto) => {
  const { name, description, type, userIds } = data;
  const [chat] = await db
    .insert(chatEntity)
    .values({
      name,
      description,
      type,
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
const sendMessage = async (data: IMessageDto, ownerId: string) => {
  const { chatId, text } = data;
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
const searchMessages = async (chatId: string, search: string = "") => {
  if (!chatId) {
    throw new Error("chatId is required");
  }

  const messageFilter = search
    ? sql`LOWER(${messageEntity.text}) ILIKE LOWER(${`%${search}%`})`
    : undefined;

  const messages = await db.query.messageEntity.findMany({
    where: (it) => and(eq(it.chatId, chatId), messageFilter),
    orderBy: (it) => it.createdAt,
  });
  const interlocutor = await db.query.userEntity.findFirst({
    where: (it) =>
      inArray(
        it.id,
        messages.map((item) => item.ownerId).filter((k) => k !== null)
      ),
  });
  const messagesWithOwners = messages.map((message) => {
    return {
      ...message,
      interlocutor,
    };
  });
  return messagesWithOwners;
};
export const chatService = {
  getMyChats,
  createChat,
  sendMessage,
  getMessages,
  searchMessages,
};
