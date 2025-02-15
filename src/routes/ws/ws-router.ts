import { FastifyInstance } from "fastify";
import { wsHandler } from "handlers/ws/ws-handler";
import { authMiddleWare } from "middleware/auth";
import { IAuthenticatedRequest } from "types/req-type";

export const wsRouter = (routers: FastifyInstance) => {
  const routes = {
    ws: () => {
      routers.register(() =>
        routers.get(
          "/ws",
          { websocket: true, preHandler: authMiddleWare.jwtCheckWebSocket },
          (socket, req: IAuthenticatedRequest) => {
            wsHandler.wsConnect(socket, req);
          }
        )
      );
    },
  };
  return {
    ...routers,
    init: () => Object.values(routes).forEach((route) => route()),
  };
};
