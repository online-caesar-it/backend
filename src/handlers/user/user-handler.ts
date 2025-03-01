import { userService } from "../../services/user/user-service";
import {
  CLIENT_ERROR,
  SUCCESS,
} from "../../consts/response-status/response-status";
import { FastifyReply, FastifyRequest } from "fastify";
import { IAuthenticatedRequest } from "types/req-type";
import { logger } from "lib/logger/logger";
import { db } from "db";
import { TClientUserUpdate } from "types/user-type";
import { IUserDto, IUserGetUsers, IUserWithWorkingDaysDto } from "dto/user-dto";
import { errorUtils } from "utils/error";
import { ROLE_EDUCATOR } from "consts/role/role";
import { directionService } from "services/direction/direction-service";

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

const createEducator = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  const data = req.body as IUserWithWorkingDaysDto;

  try {
    const user = await userService.createUser({
      ...data.user,
      role: ROLE_EDUCATOR,
    });
    await directionService.setUserToDirection({
      userId: user.id,
      direction: data.directionIds.map((it) => ({
        directionId: it,
      })),
    });
    reply.status(SUCCESS).send(user);
  } catch (error) {
    // await userService.deleteUserByEmail(data.user.email);
    errorUtils.replyError("error in create educator", error, reply);
  }
};
const getEducators = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.query as IUserGetUsers;
    const educators = await userService.getEducators(data);
    reply.status(SUCCESS).send(educators);
  } catch (error) {
    errorUtils.replyError("error in get educator", error, reply);
  }
};
const getStudents = async (req: IAuthenticatedRequest, reply: FastifyReply) => {
  try {
    const data = req.query as IUserGetUsers;
    const students = await userService.getStudents(data);
    reply.status(SUCCESS).send(students);
  } catch (error) {
    errorUtils.replyError("error in get students", error, reply);
  }
};
const updateUserHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const clientUser = (await req.body) as TClientUserUpdate;

    if (!clientUser) {
      return reply.code(400).send({ message: "User data is required" });
    }

    const updateUserData = await userService.updateUserService(clientUser);
    const updatedUserConfig = await userService.updateUserConfigService(
      clientUser
    );

    return {
      updatedUser: updateUserData,
      updatedUserConfig: updatedUserConfig,
    };
  } catch (error) {
    if (error instanceof Error) {
      reply.status(CLIENT_ERROR).send({ message: error.message });
    } else {
      logger.error("Error while updating user", error as string);
      reply.status(CLIENT_ERROR).send({ message: "An unknown error occurred" });
    }
  }
};
const getUsersWithDirection = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const userId = req.user?.id as string;
    const users = await userService.getUsersWithDirection(userId);
    reply.status(SUCCESS).send(users);
  } catch (error) {
    errorUtils.replyError("error in getUsersWithDirection", error, reply);
  }
};
export const userHandlers = {
  getAllHandler,
  getSelfHandler,
  createEducator,
  getEducators,
  updateUserHandler,
  getStudents,
  getUsersWithDirection,
};
