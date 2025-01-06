import fastify from "fastify";
import { envConfig } from "./env";
import { userRouter } from "./routes/user/user-router";
import { errorMiddleware } from "./middleware/error";
import { authRouter } from "./routes/auth/auth-router";
import cors from "@fastify/cors";
import { logger } from "lib/logger/logger";

const app = fastify();
app.setErrorHandler(errorMiddleware);
app.register(cors, {
  origin: ["*"],
  allowedHeaders: ["*"],
  methods: ["*"],
});
const start = async () => {
  try {
    const authRouterInstance = authRouter(app);
    const userRouterInstance = userRouter(app);
    userRouterInstance.getSelf();
    userRouterInstance.getAll();
    authRouterInstance.signIn();
    authRouterInstance.signUp();
    authRouterInstance.verifySignUp();
    authRouterInstance.verifySignIn();
    authRouterInstance.refreshToken();
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
