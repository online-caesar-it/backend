import { get, post } from "routes";
import { entities } from "../../enums/entities/entities";
import { FastifyInstance } from "fastify";
import { authMiddleWare } from "../../middleware/auth";
import { chatHandlers } from "handlers/chat/chat-handler";
import { errorMiddlewares } from "middleware/error";

export const chatRouter = (routers: FastifyInstance) => {
  const path = `/${entities.CHAT}`;
  return {
    getMyChats: () => {
      get({
        path: `${path}/getMyChats`,
        handler: chatHandlers.getMyChatsHandler,
        routers,
        options: { preHandler: authMiddleWare.jwtCheck },
      });
    },
    create: () => {
      post({
        path: `${path}/create`,
        handler: chatHandlers.createChat,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            errorMiddlewares.checkRequestBody,
          ],
        },
      });
    },
  };
};
