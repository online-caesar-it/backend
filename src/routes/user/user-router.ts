import { entities } from "../../enums/entities/entities";
import { get, put, post } from "..";
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
    edit: () =>
      put({
        path: `${path}/update`,
        handler: userHandlers.updateUserHandler,
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
    getEducators: () => {
      get({
        path: `${path}/educator/get-all`,
        handler: userHandlers.getEducators,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            roleMiddleWare.checkedRoleAdmin,
          ],
        },
      });
    },
    getStudents: () => {
      get({
        path: `${path}/student/get-all`,
        handler: userHandlers.getStudents,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            roleMiddleWare.checkedRoleAdmin,
          ],
        },
      });
    },
    getUsersWithDirection: () => {
      get({
        path: `${path}/direction/get-all`,
        handler: userHandlers.getUsersWithDirection,
        routers,
        options: {
          preHandler: [authMiddleWare.jwtCheck],
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
