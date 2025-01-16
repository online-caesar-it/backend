import fastify from "fastify";
import { envConfig } from "./env";
import cors from "@fastify/cors";
import { logger } from "lib/logger/logger";
import websocket from "@fastify/websocket";
import { init } from "init";
const app = fastify();
app.register(cors, {
  origin: ["*"],
  allowedHeaders: ["*"],
  methods: ["*"],
});
app.register(websocket);
const start = async () => {
  try {
    init.registerRoutes(app);
    await app.listen({
      port: Number(envConfig.PORT),
      host: envConfig.HOST,
    });
    logger.info("server start", `Server is running on port ${envConfig.PORT}`);
  } catch (error) {
    logger.error("server error", error as string);
    process.exit(1);
  }
};

start();
