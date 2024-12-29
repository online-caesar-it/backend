import fastify from "fastify";
import { envConfig } from "./env";
import { authRouter } from "@routes/auth/auth-router";
import { checkRequestBody, errorMiddleware } from "middleware/error";
const app = fastify();
app.addHook("preHandler", checkRequestBody);

app.setErrorHandler(errorMiddleware);
const start = async () => {
  try {
    const routers = [authRouter(app)];
    for (const route of routers) {
      route.register();
    }
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
