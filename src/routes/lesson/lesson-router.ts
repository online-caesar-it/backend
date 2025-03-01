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
    getLessonByModuleId: () => {
      get({
        path: `${path}/get-lesson-by-module`,
        handler: lessonHandler.getLessonByModuleId,
        routers,
        options: {
          preHandler: [authMiddleWare.jwtCheck],
        },
      });
    },
    updateLesson: () => {
      get({
        path: `${path}/update`,
        handler: lessonHandler.updateLesson,
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
    deleteLesson: () => {
      get({
        path: `${path}/delete`,
        handler: lessonHandler.deleteLesson,
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
    getMyLessons: () => {
      get({
        path: `${path}/get-my-lessons`,
        handler: lessonHandler.getByLessonByDirection,
        routers,
        options: {
          preHandler: [authMiddleWare.jwtCheck],
        },
      });
    },
    getLessonsByDirection: () => {
      get({
        path: `${path}/get-lessons-by-direction-id`,
        handler: lessonHandler.getLessonsByDirectionId,
        routers,
        options: {
          preHandler: [authMiddleWare.jwtCheck],
        },
      });
    },
  };
  return {
    ...routes,
    init: () => Object.values(routes).forEach((route) => route()),
  };
};
