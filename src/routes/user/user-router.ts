import { entities } from "enums/entities/entities";
import { get } from "..";
import { getSelfHandler } from "@handlers/user/user-handler";
import { FastifyInstance } from "fastify";

export const userRouter = (routers: FastifyInstance) => {
  return {
    getSelf: () => {
      get({
        path: `/${entities.USER}/getSelf`,
        handler: async (req, reply) => await getSelfHandler(req, reply),
        routers,
      });
    },
  };
};
