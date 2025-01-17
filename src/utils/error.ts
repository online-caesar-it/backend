import { UNKNOW_ERROR } from "consts/response-status/response-message";
import { CLIENT_ERROR } from "consts/response-status/response-status";
import { FastifyReply } from "fastify";
import { logger } from "lib/logger/logger";

const replyError = (text: string, error: unknown, reply: FastifyReply) => {
  if (error instanceof Error) {
    logger.error(text, error.message);
    reply.status(CLIENT_ERROR).send({ message: error.message });
  } else {
    logger.error(text, UNKNOW_ERROR);
    reply.status(CLIENT_ERROR).send({ message: UNKNOW_ERROR });
  }
};
export const errorUtils = {
  replyError,
};
