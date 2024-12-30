import { FastifyInstance } from "fastify";
import { post } from "..";
import { entities } from "../../enums/entities/entities";
import {
  registerHandler,
  loginHandler,
} from "../../handlers/auth/auth-handler";

export const authRouter = (routers: FastifyInstance) => {
  return {
    register: () => {
      post({
        path: `/${entities.AUTH}/register`,
        handler: async (req, reply) => await registerHandler(req, reply),
        routers,
      });
    },
    login: () => {
      post({
        path: `/${entities.AUTH}/login`,
        handler: async (req, reply) => await loginHandler(req, reply),
        routers,
      });
    },
  };
};
