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

const wsApp = fastify();

wsApp.register(websocket);

const startApiServer = async () => {
  try {
    init.registerRoutes(app, wsApp);
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

const startWebSocketServer = async () => {
  try {
    await wsApp.listen({
      port: Number(envConfig.WS_PORT),
      host: envConfig.HOST,
    });
    logger.info(
      "WebSocket server start",
      `WebSocket server is running on port ${envConfig.WS_PORT}`
    );
  } catch (error) {
    logger.error("WebSocket server error", error as string);
    process.exit(1);
  }
};

startApiServer();
startWebSocketServer();
