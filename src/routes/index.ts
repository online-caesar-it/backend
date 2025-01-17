import { FastifyInstance, RouteHandlerMethod, RouteOptions } from "fastify";

type ArgumentsRouterType = {
  path: string;
  handler: RouteHandlerMethod;
  routers: FastifyInstance;
  options?: Partial<RouteOptions>;
};

export const post = ({
  path,
  handler,
  routers,
  options,
}: ArgumentsRouterType) => {
  routers.post(path, { ...options, handler });
};

export const get = ({
  path,
  handler,
  routers,
  options,
}: ArgumentsRouterType) => {
  routers.get(path, { ...options, handler });
};
export const put = ({
  path,
  handler,
  routers,
  options,
}: ArgumentsRouterType) => {
  routers.put(path, { ...options, handler });
};
export const remove = ({
  path,
  handler,
  routers,
  options,
}: ArgumentsRouterType) => {
  routers.delete(path, { ...options, handler });
};
