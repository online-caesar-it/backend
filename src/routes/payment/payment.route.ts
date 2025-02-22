import { entities } from "enums/entities/entities";
import { FastifyInstance } from "fastify";
import { post, get, put } from "routes";
export const paymentRoute = (routers: FastifyInstance) => {
  const path = `/${entities.PAYMENT}`;
  const routes = {
    create: () => {
      post({
        path: `${path}/create`,
        handler: () => {},
        routers,
      });
    },
    get: () => {
      get({
        path: `${path}/get`,
        handler: () => {},
        routers,
      });
    },
  };
  return {
    ...routers,
    init: () => Object.values(routes).forEach((route) => route()),
  };
};
