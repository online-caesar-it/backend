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
      logger.error("error in getMyChatsHandler", "Unknow error");
    }
  }
};
export const chatHandlers = {
  getMyChatsHandler,
};
