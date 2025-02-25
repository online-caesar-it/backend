import { entities } from "enums/entities/entities";
import { FastifyInstance } from "fastify";
import { orderHandler } from "handlers/order/order-handler";
import { get, post } from "routes";

export const orderRoute = (routers: FastifyInstance) => {
  const path = `/${entities.ORDER}`;
  const routes = {
    create: () => {
      post({
        path: `${path}/create`,
        handler: orderHandler.createOrder,
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
