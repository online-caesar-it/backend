import fastify from "fastify";
import { envConfig } from "./env";

const app = fastify();

const start = async () => {
  try {
    await app.listen({ port: Number(envConfig.PORT) || 5000 });
    console.log(`Server is running on port ${envConfig.PORT}`);
  } catch (error) {
    console.error("Errorr:", error);
    process.exit(1);
  }
};

start();
