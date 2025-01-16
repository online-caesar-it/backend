import { FastifyInstance } from "fastify";
import { authRouter } from "routes/auth/auth-router";
import { chatRouter } from "routes/chat/chat-router";
import { directionRouter } from "routes/direction/direction-router";
import { userRouter } from "routes/user/user-router";

const registerRoutes = (app: FastifyInstance) => {
  const routers = [
    authRouter(app),
    userRouter(app),
    chatRouter(app),
    directionRouter(app),
  ];
  routers.forEach((router) => router.init());
};
export const init = {
  registerRoutes,
};
