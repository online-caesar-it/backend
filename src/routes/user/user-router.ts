import { entities } from "../../enums/entities/entities";
import { get, post } from "..";
import { FastifyInstance } from "fastify";
import { userHandlers } from "../../handlers/user/user-handler";
import { authMiddleWare } from "../../middleware/auth";
import { errorMiddlewares } from "middleware/error";
import { roleMiddleWare } from "middleware/role";

export const userRouter = (routers: FastifyInstance) => {
  const path = `/${entities.USER}`;
  const routes = {
    getSelf: () =>
      get({
        path: `${path}/getSelf`,
        handler: userHandlers.getSelfHandler,
        routers,
        options: { preHandler: authMiddleWare.jwtCheck },
      }),
    getAll: () =>
      get({
        path: `${path}/getAll`,
        handler: userHandlers.getAllHandler,
        routers,
      }),
    createEducator: () => {
      post({
        path: `${path}/educator/create`,
        handler: userHandlers.createEducator,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            errorMiddlewares.checkRequestBody,
            roleMiddleWare.checkedRoleAdmin,
          ],
        },
      });
    },
  };

  return {
    ...routes,
    init: () => {
      Object.values(routes).forEach((route) => route());
    },
  };
};
