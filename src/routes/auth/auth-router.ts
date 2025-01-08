import { FastifyInstance } from "fastify";
import { post } from "..";
import { entities } from "../../enums/entities/entities";
import { setRole } from "../../middleware/role";
import { authHandlers } from "../../handlers/auth/auth-handler";
import { errorMiddlewares } from "middleware/error";

export const authRouter = (routers: FastifyInstance) => {
  const path = `/${entities.AUTH}`;
  return {
    signUp: () => {
      post({
        path: `${path}/sign-up/by-email`,
        handler: authHandlers.initiateSignUpHandler,
        routers,
        options: { preHandler: [errorMiddlewares.checkRequestBody, setRole] },
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
        options: { preHandler: errorMiddlewares.checkRequestBody },
      });
    },
    verifySignIn: () => {
      post({
        path: `${path}/sign-in/verify`,
        handler: authHandlers.verifySignInHandler,
        routers,
      });
    },
    refreshToken: () => {
      post({
        path: `${path}/refresh`,
        handler: authHandlers.refreshTokenHandler,
        routers,
      });
    },
  };
};
