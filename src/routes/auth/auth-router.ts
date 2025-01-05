import { FastifyInstance } from "fastify";
import { post } from "..";
import { entities } from "../../enums/entities/entities";
import { checkRequestBody } from "../../middleware/error";
import { setRole } from "../../middleware/role";
import { authHandlers } from "../../handlers/auth/auth-handler";

export const authRouter = (routers: FastifyInstance) => {
  const path = `/${entities.AUTH}`;
  return {
    signUp: () => {
      post({
        path: `${path}/sign-up/by-email`,
        handler: authHandlers.initiateSignInHandler,
        routers,
        options: { preHandler: [checkRequestBody, setRole] },
      });
    },
    verifySignUp: () => {
      post({
        path: `${path}/sign-up/verify`,
        handler: authHandlers.verifySignUpHandler,
        routers,
      });
    },
    signIn: () => {
      post({
        path: `${path}/sign-in/by-email`,
        handler: authHandlers.initiateSignInHandler,
        routers,
        options: { preHandler: checkRequestBody },
      });
    },
    verifySignIn: () => {
      post({
        path: `${path}/sign-in/verify`,
        handler: authHandlers.verifySignInHandler,
        routers,
      });
    },
  };
};
