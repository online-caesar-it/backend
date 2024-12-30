import jwt from "jsonwebtoken";
import { FastifyRequest, FastifyReply } from "fastify";
import { envConfig } from "../env";
import { UNAUTHORIZED } from "consts/response-status/response-status";

export const checkToken = async (req: FastifyRequest, reply: FastifyReply) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    reply
      .status(UNAUTHORIZED)
      .send({ message: "Authorization header required" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, String(envConfig.SECRET_KEY));
    (req as any).user = decoded;
  } catch (err) {
    reply.status(UNAUTHORIZED).send({ message: "Invalid token" });
  }
};
