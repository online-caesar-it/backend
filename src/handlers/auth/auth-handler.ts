import { IUserDto } from "../../dto/user-dto";
import { authService } from "./../../services/auth/auth-service";
import { USER_SUCCESS_REGISTER } from "../../consts/response-status/response-message";
import {
  CLIENT_ERROR,
  CREATE_SUCCESS,
  SUCCESS,
} from "../../consts/response-status/response-status";
import { FastifyReply, FastifyRequest } from "fastify";

export const initiateSignUpHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userData = req.body as IUserDto;

    await authService.initiateRegistration(userData);

    reply.status(CREATE_SUCCESS).send({
      message: "",
    });
  } catch (err) {
    if (err instanceof Error) {
      reply.status(CLIENT_ERROR).send({ message: err.message });
    } else {
      reply.status(CLIENT_ERROR).send({ message: "An unknown error occurred" });
    }
  }
};

export const verifySignUpHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { token } = req.body as { token: string };
    const { user, accessToken } = await authService.verifyRegistrationToken(
      token
    );

    reply.status(SUCCESS).send({
      message: USER_SUCCESS_REGISTER,
      user,
      accessToken,
    });
  } catch (err) {
    if (err instanceof Error) {
      reply.status(CLIENT_ERROR).send({ message: err.message });
    } else {
      reply.status(CLIENT_ERROR).send({ message: "An unknown error occurred" });
    }
  }
};

export const initiateSignInHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { email } = req.body as { email: string };

    // await authService.initiateLogin(email);

    reply.status(SUCCESS).send({
      message: "Успешно",
    });
  } catch (err) {
    if (err instanceof Error) {
      reply.status(CLIENT_ERROR).send({ message: err.message });
    } else {
      reply.status(CLIENT_ERROR).send({ message: "An unknown error occurred" });
    }
  }
};

// Хендлер для подтверждения входа
export const verifySignInHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { token } = req.query as { token: string };
    const { user, accessToken } = await authService.verifyLoginToken(token);

    reply.status(SUCCESS).send({
      user,
      accessToken,
    });
  } catch (err) {
    if (err instanceof Error) {
      reply.status(CLIENT_ERROR).send({ message: err.message });
    } else {
      reply.status(CLIENT_ERROR).send({ message: "An unknown error occurred" });
    }
  }
};
