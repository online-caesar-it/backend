import { CLIENT_ERROR } from "../../consts/response-status/response-status";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  getAllService,
  getSelfService,
} from "../../services/user/user-service";

export const getSelfHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userId = req?.user?.id;
    if (!userId) {
      reply.status(CLIENT_ERROR).send({ message: "User ID not found" });
      return;
    }
    const user = await getSelfService(userId);
    console.log(user);
    return user;
  } catch (err) {
    if (err instanceof Error) {
      reply.status(CLIENT_ERROR).send({ message: err.message });
    } else {
      console.log("Unknown error:", err);
      reply.status(CLIENT_ERROR).send({ message: "An unknown error occurred" });
    }
  }
};

export const getAllHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const users = await getAllService();
  return users;
};
