import { FastifyInstance } from "fastify";
import { post } from "..";
import { entities } from "../../enums/entities/entities";
import { checkRequestBody } from "../../middleware/error";
import { setRole } from "middleware/role";
import {
  initiateSignInHandler,
  initiateSignUpHandler,
  verifySignInHandler,
  verifySignUpHandler,
} from "handlers/auth/auth-handler";

export const authRouter = (routers: FastifyInstance) => {
  return {
    signUp: () => {
      post({
        path: `/${entities.AUTH}/sign-up/by-email`,
        handler: async (req, reply) => await initiateSignUpHandler(req, reply),
        routers,
        options: { preHandler: [checkRequestBody, setRole] },
      });
    },
    verifySignUp: () => {
      post({
        path: `/${entities.AUTH}/signUp/verify`,
        handler: async (req, reply) => await verifySignUpHandler(req, reply),
        routers,
      });
    },
    signIn: () => {
      post({
        path: `/${entities.AUTH}/signIn/by-email`,
        handler: async (req, reply) => await initiateSignInHandler(req, reply),
        routers,
        options: { preHandler: checkRequestBody },
      });
    },
    verifySignIn: () => {
      post({
        path: `/${entities.AUTH}/signIn/verify`,
        handler: async (req, reply) => await verifySignInHandler(req, reply),
        routers,
      });
    },
  };
};
