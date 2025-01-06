import { IUserDto } from "../../dto/user-dto";
import { authService } from "./../../services/auth/auth-service";
import {
  SEND_EMAIL_SUCCESS,
  USER_SUCCESS_REGISTER,
} from "../../consts/response-status/response-message";
import {
  CLIENT_ERROR,
  CREATE_SUCCESS,
  SUCCESS,
} from "../../consts/response-status/response-status";
import { FastifyReply, FastifyRequest } from "fastify";
import { jwtService } from "services/jwt/jwt-service";

const initiateSignUpHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userData = req.body as IUserDto;

    await authService.initiateRegistration(userData);

    reply.status(CREATE_SUCCESS).send({
      message: SEND_EMAIL_SUCCESS,
    });
  } catch (err) {
    console.error(err, "err");
    if (err instanceof Error) {
      reply.status(CLIENT_ERROR).send({ message: err.message });
    } else {
      reply.status(CLIENT_ERROR).send({ message: "An unknown error occurred" });
    }
  }
};

const verifySignUpHandler = async (
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

const initiateSignInHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { email } = req.body as { email: string };

    await authService.initiateLogin(email);

    reply.status(SUCCESS).send({
      message: SEND_EMAIL_SUCCESS,
    });
  } catch (err) {
    if (err instanceof Error) {
      reply.status(CLIENT_ERROR).send({ message: err.message });
    } else {
      reply.status(CLIENT_ERROR).send({ message: "An unknown error occurred" });
    }
  }
};

const verifySignInHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { token } = req.body as { token: string };
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
const refreshTokenHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { refreshToken } = req?.body as {
      refreshToken: string;
    };
    const tokens = await jwtService.refreshTokens(refreshToken);
    reply.status(SUCCESS).send({
      tokens,
      message: "Токены успешно обновлены",
    });
  } catch (error) {
    if (error instanceof Error) {
      reply.status(CLIENT_ERROR).send({
        message: error.message,
      });
    } else {
      reply.status(CLIENT_ERROR).send({
        message: "Неизвестная ошибка",
      });
    }
  }
};
export const authHandlers = {
  verifySignInHandler,
  verifySignUpHandler,
  initiateSignInHandler,
  initiateSignUpHandler,
  refreshTokenHandler,
};
