import { userService } from "../../services/user/user-service";
import { CLIENT_ERROR } from "../../consts/response-status/response-status";
import { FastifyReply, FastifyRequest } from "fastify";
import { IAuthenticatedRequest } from "types/req-type";
import { logger } from "lib/logger/logger";

const getSelfHandler = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const userId = req?.user?.id;
    if (!userId) {
      reply.status(CLIENT_ERROR).send({ message: "User ID not found" });
      return;
    }
    const user = await userService.getSelfService(userId);
    return user;
  } catch (err) {
    if (err instanceof Error) {
      reply.status(CLIENT_ERROR).send({ message: err.message });
    } else {
      logger.error("error get self", err as string);
      reply.status(CLIENT_ERROR).send({ message: "An unknown error occurred" });
    }
  }
};

const getAllHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const users = await userService.getAllService();
  return users;
};
export const userHandlers = {
  getAllHandler,
  getSelfHandler,
};
