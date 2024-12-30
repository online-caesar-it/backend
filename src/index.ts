import fastify from "fastify";
import { envConfig } from "./env";
import { userRouter } from "./routes/user/user-router";
import { checkRequestBody, errorMiddleware } from "./middleware/error";
import { authRouter } from "./routes/auth/auth-router";
const app = fastify();
app.addHook("preHandler", checkRequestBody);

app.setErrorHandler(errorMiddleware);
const start = async () => {
  try {
    const authRouterInstance = authRouter(app);
    const userRouterInstance = userRouter(app);
    userRouterInstance.getSelf();
    authRouterInstance.login();
    authRouterInstance.register();
    await app.listen({
      port: Number(envConfig.PORT) || 5000,
      host: "127.0.0.2",
    });
    console.log(`Server is running on port ${envConfig.PORT}`);
  } catch (error) {
    console.error("Errorr:", error);
    process.exit(1);
  }
};

start();
