import { eq } from "drizzle-orm";
import { db } from "../../db";
import { chatToUserEntity } from "../../db/entities/chat/chat-to-users.entity";

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

const createChat = () => {};

export const chatService = {
  getMyChats,
};
