import { directionHandlers } from "../../handlers/direction/direction-handler";
import { entities } from "enums/entities/entities";
import { get, post, put, remove } from "..";
import { FastifyInstance } from "fastify";
import { errorMiddlewares } from "middleware/error";
import { authMiddleWare } from "middleware/auth";
import { roleMiddleWare } from "middleware/role";

export const directionRouter = (routers: FastifyInstance) => {
  const path = `/${entities.DIRECTION}`;
  const routes = {
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
    deleteDirection: () => {
      remove({
        path: `${path}/delete`,
        handler: directionHandlers.deleteDirection,
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
    editDirection: () => {
      put({
        path: `${path}/update`,
        handler: directionHandlers.editDirection,
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
    getDirections: () => {
      get({
        path: `${path}/get-all`,
        handler: directionHandlers.getDirections,
        routers,
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
            roleMiddleWare.checkedRoleAdmin,
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
            roleMiddleWare.checkedRoleAdmin,
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
            roleMiddleWare.checkedRoleAdmin,
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
            roleMiddleWare.checkedRoleAdmin,
          ],
        },
      });
    },
    getUsersByDirection: () => {
      get({
        path: `${path}/users`,
        handler: directionHandlers.getUsersByDirection,
        routers,
        options: {
          preHandler: [authMiddleWare.jwtCheck],
        },
      });
    },
    updateUserByDirection: () => {
      post({
        path: `${path}/users/attach`,
        handler: directionHandlers.attachUserToDirection,
        routers,
        options: {
          preHandler: [
            authMiddleWare.jwtCheck,
            errorMiddlewares.checkRequestBody,
          ],
        },
      });
    },
    getMyDirections: () => {
      get({
        path: `${path}/users/direction-all`,
        handler: directionHandlers.getMyDirections,
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
