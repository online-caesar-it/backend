import {
  ROLE_NOT_AUTH_ADMIN,
  ROLE_NOT_AUTH_EDUCATOR,
} from "consts/response-status/response-message";
import { CLIENT_ERROR } from "consts/response-status/response-status";
import { ROLE_ADMIN, ROLE_EDUCATOR } from "consts/role/role";
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
    reply.status(CLIENT_ERROR).send({
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
    reply.status(CLIENT_ERROR).send({
      message: ROLE_NOT_AUTH_EDUCATOR,
    });
  }
};
export const roleMiddleWare = {
  checkedRoleAdmin,
  checkedRoleEducator,
};
