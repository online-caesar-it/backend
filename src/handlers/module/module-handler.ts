import { IModuleDto } from "./../../dto/direction-dto";
import { SUCCESS } from "consts/response-status/response-status";
import { FastifyReply, FastifyRequest } from "fastify";
import { moduleService } from "services/module/module-service";
import { IAuthenticatedRequest } from "types/req-type";
import { errorUtils } from "utils/error";

const createModule = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IModuleDto;
    const module = await moduleService.createModule(data);
    reply.status(SUCCESS).send(module);
  } catch (error) {
    errorUtils.replyError("error in create module", error, reply);
  }
};
const getModuleByDirectionId = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = req.query as {
      id: string;
    };
    const modules = await moduleService.getModuleByDirectionId(id);
    return modules;
  } catch (error) {
    errorUtils.replyError("error in get module", error, reply);
  }
};
const editModule = async (req: IAuthenticatedRequest, reply: FastifyReply) => {
  try {
    const { moduleId, name, description } = req.body as {
      moduleId: string;
      name?: string;
      description?: string;
    };

    const updatedModule = await moduleService.editModule(
      moduleId,
      name,
      description
    );

    reply.status(SUCCESS).send(updatedModule);
  } catch (error) {
    errorUtils.replyError("error in edit module", error, reply);
  }
};
const deleteModule = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = req.query as {
      id: string;
    };
    const module = await moduleService.deleteModule(id);
    return module;
  } catch (error) {
    errorUtils.replyError("error in delete module", error, reply);
  }
};
export const moduleHandler = {
  createModule,
  getModuleByDirectionId,
  editModule,
  deleteModule,
};
