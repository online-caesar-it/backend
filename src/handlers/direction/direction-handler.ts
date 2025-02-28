import {
  SUCCESS_DIRECTION_ATTACHED_TO_USER,
  UNKNOW_ERROR,
} from "consts/response-status/response-message";
import {
  CLIENT_ERROR,
  CREATE_SUCCESS,
  SUCCESS,
} from "consts/response-status/response-status";
import {
  IDirectionDto,
  IGroupDto,
  IUserByDirection,
  IUserToDirectionDto,
} from "dto/direction-dto";
import { FastifyReply, FastifyRequest } from "fastify";
import { logger } from "lib/logger/logger";
import { directionService } from "services/direction/direction-service";
import { IAuthenticatedRequest } from "types/req-type";
import { errorUtils } from "utils/error";

const createDirection = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IDirectionDto;
    const direction = await directionService.createDirection(data);
    reply.status(CREATE_SUCCESS).send(direction);
  } catch (error) {
    errorUtils.replyError("error in create direction", error, reply);
  }
};

const createGroup = async (req: IAuthenticatedRequest, reply: FastifyReply) => {
  try {
    const data = req.body as IGroupDto;
    const group = await directionService.createGroup(data);
    reply.status(CREATE_SUCCESS).send(group);
  } catch (error) {
    if (error instanceof Error) {
      logger.error("error in create group handler", error.message);
      reply.status(CLIENT_ERROR).send({ message: error.message });
    } else {
      logger.error("error in create group handler", UNKNOW_ERROR);
      reply.status(CLIENT_ERROR).send({ message: UNKNOW_ERROR });
    }
  }
};

const addDirectionToGroup = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const { directionId, groupId } = req.body as {
      directionId: string;
      groupId: string;
    };
    const result = await directionService.addDirectionToGroup(
      directionId,
      groupId
    );
    reply.status(CREATE_SUCCESS).send(result);
  } catch (error) {
    if (error instanceof Error) {
      logger.error("error in add direction to group handler", error.message);
      reply.status(CLIENT_ERROR).send({ message: error.message });
    } else {
      logger.error("error in add direction to group handler", UNKNOW_ERROR);
      reply.status(CLIENT_ERROR).send({ message: UNKNOW_ERROR });
    }
  }
};
const addStudentToGroup = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const { userId, groupId } = req.body as { userId: string; groupId: string };
    const result = await directionService.addStudentToGroup(userId, groupId);
    reply.status(CREATE_SUCCESS).send(result);
  } catch (error) {
    if (error instanceof Error) {
      logger.error("error in add student to group handler", error.message);
      reply.status(CLIENT_ERROR).send({ message: error.message });
    } else {
      logger.error("error in add student to group handler", UNKNOW_ERROR);
      reply.status(CLIENT_ERROR).send({ message: UNKNOW_ERROR });
    }
  }
};

const getStudentsByDirectionAndGroup = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const { groupId } = req.query as {
      groupId: string;
    };
    const students = await directionService.getStudentsByDirectionAndGroup(
      groupId
    );
    reply.status(SUCCESS).send(students);
  } catch (error) {
    if (error instanceof Error) {
      logger.error("error in get students handler", error.message);
      reply.status(CLIENT_ERROR).send({ message: error.message });
    } else {
      logger.error("error in get students handler", UNKNOW_ERROR);
      reply.status(CLIENT_ERROR).send({ message: UNKNOW_ERROR });
    }
  }
};
const getStudentsByEducatorId = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const educatorId = req?.user?.id;
    const { search } = req.query as {
      search: string;
    };
    const students = await directionService.getStudentsByEducatorId(
      educatorId || "",
      search
    );
    return reply.status(SUCCESS).send(students);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        "Error in get students by educatorId handler",
        error.message
      );
      reply.status(CLIENT_ERROR).send({ message: error.message });
    } else {
      logger.error(
        "Unknown error in get students by educatorId handler",
        UNKNOW_ERROR
      );
      reply.status(CLIENT_ERROR).send({ message: UNKNOW_ERROR });
    }
  }
};
const getDirections = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const directions = await directionService.getDirections();
    reply.status(SUCCESS).send(directions);
  } catch (error) {
    errorUtils.replyError("error in get directions", error, reply);
  }
};
const editDirection = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IDirectionDto & {
      id: string;
    };
    const direction = await directionService.updateDirection(data);
    reply.status(SUCCESS).send(direction);
  } catch (error) {
    errorUtils.replyError("error in update direction", error, reply);
  }
};
const deleteDirection = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = req.query as {
      id: string;
    };
    const directionDeleted = await directionService.deleteDirection(id);
    reply.status(SUCCESS).send(directionDeleted);
  } catch (error) {
    errorUtils.replyError("error in delete direction", error, reply);
  }
};
const getUsersByDirection = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.query as IUserByDirection;
    const users = await directionService.getUserWithDirection(data);
    reply.status(SUCCESS).send(users);
  } catch (error) {
    errorUtils.replyError("error in get users by direction", error, reply);
  }
};
const attachUserToDirection = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IUserToDirectionDto;
    await directionService.setUserToDirection(data);
    reply.status(SUCCESS).send({
      message: SUCCESS_DIRECTION_ATTACHED_TO_USER,
    });
  } catch (error) {
    errorUtils.replyError("error in attachDirectionToUser", error, reply);
  }
};
const getMyDirections = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const userId = req.user?.id;
    const data = await directionService.getDirectionsByUserId(userId ?? "");
    reply.status(SUCCESS).send(data);
  } catch (error) {
    errorUtils.replyError("error in getMyDirections", error, reply);
  }
};
export const directionHandlers = {
  createDirection,
  createGroup,
  addDirectionToGroup,
  getStudentsByDirectionAndGroup,
  addStudentToGroup,
  getStudentsByEducatorId,
  getDirections,
  editDirection,
  deleteDirection,
  getUsersByDirection,
  attachUserToDirection,
  getMyDirections,
};
