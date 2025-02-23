import { entities } from "enums/entities/entities";
import { FastifyInstance } from "fastify";
import { scheduleHandler } from "handlers/schedule/schedule.handler";
import { authMiddleWare } from "middleware/auth";
import { errorMiddlewares } from "middleware/error";
import { roleMiddleWare } from "middleware/role";
import { post, get, put } from "routes";

export const scheduleRoute = (routers: FastifyInstance) => {
  const path = `/${entities.SCHEDULE}`;

  const routes = {
    create: () => {
      post({
        path: `${path}/create`,
        handler: scheduleHandler.createSchedule,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            errorMiddlewares.checkRequestBody,
            roleMiddleWare.checkedRoleEducator,
          ],
        },
      });
    },
    getSchedule: () => {
      get({
        path: `${path}/get`,
        handler: scheduleHandler.getSchedule,
        routers,
        options: {
          preHandler: authMiddleWare.jwtCheck,
        },
      });
    },
    getSchedulesFilter: () => {
      get({
        path: `${path}/get/filter`,
        handler: scheduleHandler.getSchedulesFilter,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            roleMiddleWare.checkedRoleAdmin,
          ],
        },
      });
    },
    createScheduleTransfer: () => {
      post({
        path: `${path}/transfer/create`,
        handler: scheduleHandler.createScheduleTransfer,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            errorMiddlewares.checkRequestBody,
          ],
        },
      });
    },
    createScheduleCancel: () => {
      post({
        path: `${path}/cancel/create`,
        handler: scheduleHandler.createScheduleCancel,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            errorMiddlewares.checkRequestBody,
          ],
        },
      });
    },
    updateScheduleCancel: () => {
      put({
        path: `${path}/cancel/update`,
        handler: scheduleHandler.updateScheduleCancel,
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
    updateScheduleTransfer: () => {
      put({
        path: `${path}/transfer/update`,
        handler: scheduleHandler.updateScheduleTransfer,
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
    getScheduleByEducator: () => {
      get({
        path: `${path}/get-by-educator`,
        handler: scheduleHandler.getScheduleEducator,
        routers,
        options: {
          preHandler: [authMiddleWare.jwtCheck],
        },
      });
    },
    setWorkingDays: () => {
      post({
        path: `${path}/working-days/create`,
        handler: scheduleHandler.createWorkingDays,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            roleMiddleWare.checkedRoleAdmin,
          ],
        },
      });
    },
    attachStudentToSchedule: () => {
      post({
        path: `${path}/attach-student`,
        handler: scheduleHandler.attachStudentToSchedule,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            errorMiddlewares.checkRequestBody,
            roleMiddleWare.checkedRoleStudent,
          ],
        },
      });
    },
    getScheduleByEducatorWithDirection: () => {
      get({
        path: `${path}/get-by-direction`,
        handler: scheduleHandler.getScheduleByDirection,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            roleMiddleWare.checkedRoleStudent,
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
