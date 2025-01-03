import { FastifyReply, FastifyRequest } from "fastify";

export const setRole = (
  req: FastifyRequest,
  reply: FastifyReply,
  done: Function
) => {
  (req as any).body.role = "user";
  done();
};
