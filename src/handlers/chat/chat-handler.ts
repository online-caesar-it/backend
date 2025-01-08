import { UNKNOW_ERROR } from "consts/response-status/response-message";
import { CLIENT_ERROR, SUCCESS } from "consts/response-status/response-status";
import { FastifyReply } from "fastify";
import { logger } from "lib/logger/logger";
import { chatService } from "services/chat/chat.service";
import { IAuthenticatedRequest } from "types/req-type";

const getMyChatsHandler = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const userId = req?.user?.id;

    const chats = await chatService.getMyChats(userId || "");
    reply.status(SUCCESS).send({
      chats,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("error in getMyChatsHandler", error.message);
      reply.status(CLIENT_ERROR).send({
        message: error,
      });
    } else {
      logger.error("error in getMyChatsHandler", UNKNOW_ERROR);
    }
  }
};
const createChat = async (req: IAuthenticatedRequest, reply: FastifyReply) => {
  try {
    const { userIds, name, description } = req.body as {
      userIds: string[];
      name: string;
      description: string;
    };
    const chat = await chatService.createChat(userIds, name, description);
    return chat;
  } catch (error) {
    if (error instanceof Error) {
      logger.error("error in createChatHandler", error.message);
    } else {
      logger.error("error in createChatHandler", UNKNOW_ERROR);
    }
  }
};
export const chatHandlers = {
  getMyChatsHandler,
  createChat,
};
