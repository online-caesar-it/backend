import { get, post } from "routes";
import { entities } from "../../enums/entities/entities";
import { FastifyInstance } from "fastify";
import { authMiddleWare } from "../../middleware/auth";
import { chatHandlers } from "handlers/chat/chat-handler";
import { errorMiddlewares } from "middleware/error";
import { chatWebSocket } from "ws/chat-ws";
import { IAuthenticatedRequest } from "types/req-type";

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
    createChat: () => {
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
    sendMessage: () => {
      post({
        path: `${path}/messages/send`,
        handler: chatHandlers.sendMessage,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            errorMiddlewares.checkRequestBody,
          ],
        },
      });
    },
    getMessages: () => {
      get({
        path: `${path}/messages/get`,
        handler: chatHandlers.getMessages,
        routers,
        options: {
          preHandler: authMiddleWare.jwtCheck,
        },
      });
    },
    initWebSocket: () => {
      routers.get(
        "/chat/ws",
        { websocket: true, preHandler: authMiddleWare.jwtCheck },
        (socket, req: IAuthenticatedRequest) => {
          chatWebSocket(socket, req);
        }
      );
    },
  };
};
