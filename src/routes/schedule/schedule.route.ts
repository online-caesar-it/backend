import { entities } from "enums/entities/entities";
import { FastifyInstance } from "fastify";
import { scheduleHandler } from "handlers/schedule/schedule.handler";
import { authMiddleWare } from "middleware/auth";
import { errorMiddlewares } from "middleware/error";
import { roleMiddleWare } from "middleware/role";
import { post } from "routes";

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
