import { CLIENT_ERROR } from "../consts/response-status/response-status";
import { error } from "../enums/error/error";
import { FastifyReply, FastifyRequest } from "fastify";

const checkRequestBody = async (req: FastifyRequest, reply: FastifyReply) => {
  if (!req.body) {
    return reply.status(CLIENT_ERROR).send({ message: error.REQUIRED });
  }
};

const errorMiddleware = async (
  error: Error,
  req: FastifyRequest,
  reply: FastifyReply
) => {
  console.error(error);

  reply.status(500).send({ message: "Internal Server Error" });
};
export const errorMiddlewares = {
  checkRequestBody,
  errorMiddleware,
};
