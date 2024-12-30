import { USER_SUCCESS_REGISTER } from "../../consts/response-status/response-message";
import {
  CLIENT_ERROR,
  CREATE_SUCCESS,
  SUCCESS,
} from "../../consts/response-status/response-status";
import { IUserDto } from "../../dto/user-dto";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  loginService,
  registerService,
} from "../../services/auth/auth-service";
export const registerHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { token, userCreating, userCreatingConfig } = await registerService(
      req.body as IUserDto
    );

    reply.status(CREATE_SUCCESS).send({
      message: USER_SUCCESS_REGISTER,
      user: userCreating,
      userConfig: userCreatingConfig,
      token,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
      reply.status(CLIENT_ERROR).send({ message: err.message });
    } else {
      console.log("Unknown error:", err);
      reply.status(CLIENT_ERROR).send({ message: "An unknown error occurred" });
    }
  }
};
export const loginHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { token, findUser } = await loginService(req.body as IUserDto);
    reply.status(SUCCESS).send({ token, user: findUser });
  } catch (err) {
    if (err instanceof Error) {
      reply.status(CLIENT_ERROR).send({ message: err.message });
    } else {
      reply.status(CLIENT_ERROR).send({ message: "An unknown error occurred" });
    }
  }
};
