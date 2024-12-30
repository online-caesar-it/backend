import { entities } from "../../enums/entities/entities";
import { get } from "..";
import { FastifyInstance } from "fastify";
import { getSelfHandler } from "../../handlers/user/user-handler";

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
