import { eq } from "drizzle-orm";
import { db } from "../../db";
import { chatToUserEntity } from "../../db/entities/chat/chat-to-users.entity";
import { chatEntity } from "db/entities/chat/chat.entity";

const getMyChats = async (userId: string) => {
  const chats = await db
    .select()
    .from(chatToUserEntity)
    .where(eq(chatToUserEntity.userId, userId));
  return chats;
};

const sendMessage = () => {};

const getMessages = () => {};

const getChatUsers = () => {};

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

export const chatService = {
  getMyChats,
  createChat,
};
