import { FastifyInstance } from "fastify";
import { authRouter } from "routes/auth/auth-router";
import { chatRouter } from "routes/chat/chat-router";
import { directionRouter } from "routes/direction/direction-router";
import { lessonRouter } from "routes/lesson/lesson-router";
import { moduleRouter } from "routes/module/module-router";
import { orderRoute } from "routes/order/order.route";
import { scheduleRoute } from "routes/schedule/schedule.route";
import { userRouter } from "routes/user/user-router";
import { wsRouter } from "routes/ws/ws-router";

const registerRoutes = (app: FastifyInstance, wsApp: FastifyInstance) => {
  const routers = [
    authRouter(app),
    userRouter(app),
    chatRouter(app, wsApp),
    directionRouter(app),
    moduleRouter(app),
    lessonRouter(app),
    wsRouter(wsApp),
    scheduleRoute(app),
    orderRoute(app),
  ];
  routers.forEach((router) => router.init());
};
export const init = {
  registerRoutes,
};
