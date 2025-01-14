import { directionHandlers } from "../../handlers/direction/direction-handler";
import { entities } from "enums/entities/entities";
import { get, post } from "..";
import { FastifyInstance } from "fastify";
import { errorMiddlewares } from "middleware/error";
import { authMiddleWare } from "middleware/auth";
import { roleMiddleWare } from "middleware/role";

export const directionRouter = (routers: FastifyInstance) => {
  const path = `/${entities.DIRECTION}`;
  return {
    create: () => {
      post({
        path: `${path}/create`,
        handler: directionHandlers.createDirection,
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
    createGroup: () => {
      post({
        path: `${path}/group/create`,
        handler: directionHandlers.createGroup,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            roleMiddleWare.checkedRoleEducator,
          ],
        },
      });
    },
    addDirectionToGroup: () => {
      post({
        path: `${path}/add-to-group`,
        handler: directionHandlers.addDirectionToGroup,
        routers,
        options: {
          preHandler: [
            errorMiddlewares.checkRequestBody,
            authMiddleWare.jwtCheck,
            roleMiddleWare.checkedRoleEducator,
          ],
        },
      });
    },
    addStudentToGroup: () => {
      post({
        path: `${path}/student/add`,
        handler: directionHandlers.addStudentToGroup,
        routers,
        options: {
          preHandler: [
            errorMiddlewares.checkRequestBody,
            authMiddleWare.jwtCheck,
            roleMiddleWare.checkedRoleEducator,
          ],
        },
      });
    },
    getStudentsByDirectionAndGroup: () => {
      get({
        path: `${path}/students`,
        handler: directionHandlers.getStudentsByDirectionAndGroup,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            roleMiddleWare.checkedRoleEducator,
          ],
        },
      });
    },
    getStudentsByEducatorId: () => {
      get({
        path: `${path}/students-by-educator`,
        handler: directionHandlers.getStudentsByEducatorId,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            roleMiddleWare.checkedRoleEducator,
          ],
        },
      });
    },
  };
};
