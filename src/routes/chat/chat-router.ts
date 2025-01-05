import { FastifyInstance } from "fastify";
import { get } from "./../index";
import { entities } from "enums/entities/entities";
import { chatHandlers } from "handlers/chat/chat-handlers";
import { checkToken } from "middleware/auth";

export const chatRouter = (routers: FastifyInstance) => {
  const path = `/${entities.PORTAL_CHAT}`;
  return {
    getMyChats: () => {
      get({
        path: path + "/chats",
        handler: chatHandlers.getMyChats,
        routers,
        options: { preHandler: checkToken },
      });
    },
  };
};
