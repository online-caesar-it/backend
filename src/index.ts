import fastify, { FastifyInstance } from "fastify";
import { envConfig } from "./env";
import { userRouter } from "./routes/user/user-router";
import { authRouter } from "./routes/auth/auth-router";
import cors from "@fastify/cors";
import { logger } from "lib/logger/logger";
import { chatRouter } from "./routes/chat/chat-router";
import websocket from "@fastify/websocket";
import { chatWebSocket } from "ws/chat-ws";
import { authMiddleWare } from "middleware/auth";
import { IAuthenticatedRequest } from "types/req-type";
const app = fastify();
app.register(cors, {
  origin: ["*"],
  allowedHeaders: ["*"],
  methods: ["*"],
});

app.register(websocket);
const start = async () => {
  try {
    const authRouterInstance = authRouter(app);
    const userRouterInstance = userRouter(app);
    const chatRouterInstance = chatRouter(app);
    userRouterInstance.getSelf();
    userRouterInstance.getAll();
    authRouterInstance.signIn();
    authRouterInstance.signUp();
    authRouterInstance.verifySignUp();
    authRouterInstance.verifySignIn();
    authRouterInstance.refreshToken();
    chatRouterInstance.getMyChats();
    chatRouterInstance.createChat();
    chatRouterInstance.sendMessage();
    chatRouterInstance.getMessages();
    app.register(() => chatRouterInstance.initWebSocket());
    await app.listen({
      port: Number(envConfig.PORT) || 5000,
      host: "127.0.0.1",
    });
    logger.info("server start", `Server is running on port ${envConfig.PORT}`);
  } catch (error) {
    logger.error("server error", error as string);
    process.exit(1);
  }
};

start();
