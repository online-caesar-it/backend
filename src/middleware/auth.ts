import { FastifyRequest, FastifyReply } from "fastify";
import { envConfig } from "../env";
import { UNAUTHORIZED } from "../consts/response-status/response-status";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger/logger";
const jwtCheck = async (req: FastifyRequest, reply: FastifyReply) => {
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
    logger.error(err, "ERR IN AUTH MIDDLEWARE");
    reply.status(UNAUTHORIZED).send({ message: "Invalid token" });
  }
};
const jwtCheckWebSocket = async (req: FastifyRequest, reply: FastifyReply) => {
  const { access_token } = req?.query as {
    access_token: string;
  };

  if (!access_token) {
    reply
      .status(UNAUTHORIZED)
      .send({ message: "Authorization header required" });
    return;
  }

  const token = access_token;
  try {
    const decoded = jwt.verify(token, String(envConfig.SECRET_KEY));
    (req as any).user = decoded;
  } catch (err) {
    logger.error(err, "ERR IN AUTH MIDDLEWARE");
    reply.status(UNAUTHORIZED).send({ message: "Invalid token" });
  }
};
export const authMiddleWare = {
  jwtCheck,
  jwtCheckWebSocket,
};
