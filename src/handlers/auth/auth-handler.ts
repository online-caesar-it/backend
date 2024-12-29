import { registerService } from "@services/auth/auth-service";
import { USER_SUCCESS_REGISTER } from "consts/response-status/response-message";
import { CREATE_SUCCESS } from "consts/response-status/response-status";
import { IUserDto } from "dto/user-dto";
import { FastifyReply, FastifyRequest } from "fastify";
import { error } from "enums/error/error";
export const registerHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { token, userCreating } = await registerService(req.body as IUserDto);
    reply.status(CREATE_SUCCESS).send({
      message: USER_SUCCESS_REGISTER,
      userCreating,
      token,
    });
  } catch (err) {
    reply.status(400).send({ message: error.USER_EXIST });
  }
};
