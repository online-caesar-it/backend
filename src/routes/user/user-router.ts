import { entities } from "../../enums/entities/entities";
import { get } from "..";
import { FastifyInstance } from "fastify";
import { userHandlers } from "../../handlers/user/user-handler";
import { authMiddleWare } from "../../middleware/auth";

export const userRouter = (routers: FastifyInstance) => {
  const path = `/${entities.USER}`;
  return {
    getSelf: () => {
      get({
        path: `${path}/getSelf`,
        handler: userHandlers.getSelfHandler,
        routers,
        options: { preHandler: authMiddleWare.jwtCheck },
      });
    },
    getAll: () => {
      get({
        path: `${path}/getAll`,
        handler: userHandlers.getAllHandler,
        routers,
      });
    },
  };
};
