import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";

type ArgumentsRouterType = {
  path: string;
  handler: RouteHandlerMethod;
  routers: FastifyInstance;
};
export const post = ({ path, handler, routers }: ArgumentsRouterType) => {
  routers.post(path, handler);
};
export const get = ({ path, handler, routers }: ArgumentsRouterType) => {
  return routers.get(path, handler);
};
export const remove = ({ path, handler, routers }: ArgumentsRouterType) => {
  return routers.delete(path, handler);
};
