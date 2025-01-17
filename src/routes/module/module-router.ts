import { entities } from "enums/entities/entities";
import { FastifyInstance } from "fastify";
import { get, post, put, remove } from "..";
import { moduleHandler } from "handlers/module/module-handler";
import { errorMiddlewares } from "middleware/error";
import { authMiddleWare } from "middleware/auth";
import { roleMiddleWare } from "middleware/role";

export const moduleRouter = (routers: FastifyInstance) => {
  const path = `/${entities.MODULE}`;
  const routes = {
    create: () => {
      post({
        path: `${path}/create`,
        handler: moduleHandler.createModule,
        routers,
        options: {
          preHandler: [
            errorMiddlewares.checkRequestBody,
            authMiddleWare.jwtCheck,
            roleMiddleWare.checkedRoleAdmin,
          ],
        },
      });
    },
    getModuleByDirectionId: () => {
      get({
        path: `${path}/getModule`,
        handler: moduleHandler.getModuleByDirectionId,
        routers,
      });
    },
    editModule: () => {
      put({
        path: `${path}/edit`,
        handler: moduleHandler.editModule,
        routers,
        options: {
          preHandler: [
            errorMiddlewares.checkRequestBody,
            authMiddleWare.jwtCheck,
            roleMiddleWare.checkedRoleAdmin,
          ],
        },
      });
    },
    deleteModule: () => {
      remove({
        path: `${path}/delete`,
        handler: moduleHandler.createModule,
        routers,
        options: {
          preHandler: [
            errorMiddlewares.checkRequestBody,
            authMiddleWare.jwtCheck,
            roleMiddleWare.checkedRoleAdmin,
          ],
        },
      });
    },
  };
  return {
    ...routes,
    init: () => Object.values(routes).forEach((route) => route()),
  };
};
