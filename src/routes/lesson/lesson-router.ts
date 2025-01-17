import { entities } from "enums/entities/entities";
import { FastifyInstance } from "fastify";
import { lessonHandler } from "handlers/lesson/lesson-handler";
import { authMiddleWare } from "middleware/auth";
import { errorMiddlewares } from "middleware/error";
import { roleMiddleWare } from "middleware/role";
import { get, post } from "..";
export const lessonRouter = (routers: FastifyInstance) => {
  const path = `/${entities.LESSON}`;

  const routes = {
    create: () => {
      post({
        path: `${path}/create`,
        handler: lessonHandler.createLesson,
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
    init: () => Object.values(routes).forEach((route) => route()),
  };
};
