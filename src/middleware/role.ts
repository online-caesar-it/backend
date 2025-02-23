import {
  ROLE_NOT_AUTH_ADMIN,
  ROLE_NOT_AUTH_EDUCATOR,
  ROLE_NOT_AUTH_STUDENT,
} from "consts/response-status/response-message";
import { FORBIDDEN } from "consts/response-status/response-status";
import { ROLE_ADMIN, ROLE_EDUCATOR, ROLE_STUDENT } from "consts/role/role";
import { FastifyReply } from "fastify";
import { userService } from "services/user/user-service";
import { IAuthenticatedRequest } from "types/req-type";

const checkedRoleAdmin = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  const userId = req.user?.id;
  const { role } = await userService.findUserById(userId || "");
  if (role !== ROLE_ADMIN) {
    reply.status(FORBIDDEN).send({
      message: ROLE_NOT_AUTH_ADMIN,
    });
  }
};
const checkedRoleEducator = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  const userId = req.user?.id;
  const { role } = await userService.findUserById(userId || "");
  if (role !== ROLE_EDUCATOR) {
    reply.status(FORBIDDEN).send({
      message: ROLE_NOT_AUTH_EDUCATOR,
    });
  }
};
const checkedRoleAdminAndEducator = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  const userId = req.user?.id;
  const { role } = await userService.findUserById(userId || "");
  if (role !== ROLE_ADMIN && role !== ROLE_EDUCATOR) {
    reply.status(FORBIDDEN).send({
      message: ROLE_NOT_AUTH_ADMIN,
    });
  }
};
const checkedRoleStudent = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  const userId = req.user?.id;
  const { role } = await userService.findUserById(userId || "");
  if (role !== ROLE_STUDENT) {
    reply.status(FORBIDDEN).send({
      message: ROLE_NOT_AUTH_STUDENT,
    });
  }
};
export const roleMiddleWare = {
  checkedRoleAdmin,
  checkedRoleEducator,
  checkedRoleAdminAndEducator,
  checkedRoleStudent,
};
