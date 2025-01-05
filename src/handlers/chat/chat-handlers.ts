import { entities } from "enums/entities/entities";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const getMyChats = async (req: FastifyRequest, reply: FastifyReply) => {};

export const chatHandlers = {
  getMyChats,
};
