import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { envConfig } from "./env";
import { entitiesUser } from "@db/entities/user/entities-user";
import { db } from "./db";

const app = fastify();
app.post("/user", async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const [user] = await db.insert(entitiesUser).values({
      email: "@lox",
      password: "pass",
      role: "schedule",
      username: "lox",
    });

    reply.status(201).send({ message: "User created", user: user });
  } catch (error) {
    console.error("Error inserting mock data:", error);
    reply.status(500).send({ message: "Failed to insert mock data" });
  }
});
const start = async () => {
  try {
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
