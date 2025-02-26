import { get, post } from "routes";
import { entities } from "../../enums/entities/entities";
import { FastifyInstance } from "fastify";
import { authMiddleWare } from "../../middleware/auth";
import { chatHandlers } from "handlers/chat/chat-handler";
import { errorMiddlewares } from "middleware/error";
import { IAuthenticatedRequest } from "types/req-type";
import { roleMiddleWare } from "middleware/role";
import { wsHandler } from "handlers/ws/ws-handler";

export const chatRouter = (
  routers: FastifyInstance,
  wsRouters: FastifyInstance
) => {
  const path = `/${entities.CHAT}`;
  const routes = {
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
    searchMessages: () => {
      get({
        path: `${path}/messages/search`,
        handler: chatHandlers.searchMessages,
        routers,
        options: {
          preHandler: authMiddleWare.jwtCheck,
        },
      });
    },
    chatWebSocket: () => {
      wsRouters.register(() =>
        wsRouters.get(
          `/ws${path}`,
          { websocket: true, preHandler: authMiddleWare.jwtCheckWebSocket },
          (socket, req: IAuthenticatedRequest) => {
            (req?.query as any).service = "chat";
            wsHandler.wsConnect(socket, req);
          }
        )
      );
    },
  };
  return {
    ...routes,
    init: () => Object.values(routes).forEach((route) => route()),
  };
};
