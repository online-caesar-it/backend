import { entities } from "../../enums/entities/entities";
import { get } from "..";
import { FastifyInstance } from "fastify";
import { userHandlers } from "../../handlers/user/user-handler";
import { checkToken } from "../../middleware/auth";

export const userRouter = (routers: FastifyInstance) => {
  const path = `/${entities.USER}`;
  return {
    getSelf: () => {
      get({
        path: `${path}/getSelf`,
        handler: userHandlers.getSelfHandler,
        routers,
        options: { preHandler: checkToken },
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
