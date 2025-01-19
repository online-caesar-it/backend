import { CLIENT_ERROR, SUCCESS } from "consts/response-status/response-status";
import { FastifyReply, FastifyRequest } from "fastify";
import { logger } from "lib/logger/logger";
import { moduleService } from "services/module/module-service";
import { IAuthenticatedRequest } from "types/req-type";

const createModule = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const { name, description, directionId } = req.body as {
      name: string;
      description: string;
      directionId: string;
    };
    const module = await moduleService.createModule(
      name,
      description,
      directionId
    );
    reply.status(SUCCESS).send(module);
  } catch (error) {
    if (error instanceof Error) {
      reply.status(CLIENT_ERROR).send({
        message: error.message,
      });
      logger.error("error in create module handler", error.message);
    } else {
      logger.error("error in create module handler", "unknow error");
    }
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
    if (error instanceof Error) {
      reply.status(CLIENT_ERROR).send({
        message: error.message,
      });
      logger.error("error in get module handler", error.message);
    } else {
      logger.error("error in get module handler", "unknow error");
    }
  }
};
const editModule = async (req: IAuthenticatedRequest, reply: FastifyReply) => {
  try {
    const { id, name, description } = req.body as {
      id: string;
      name?: string;
      description?: string;
    };

    const updatedModule = await moduleService.editModule(id, name, description);

    reply.status(SUCCESS).send(updatedModule);
  } catch (error) {
    if (error instanceof Error) {
      reply.status(CLIENT_ERROR).send({
        message: error.message,
      });
      logger.error("Error in edit module handler", error.message);
    } else {
      logger.error("Error in edit module handler", "unknown error");
    }
  }
};
const deleteModule = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = req.body as {
      id: string;
    };
    const module = await moduleService.deleteModule(id);
    return module;
  } catch (error) {
    if (error instanceof Error) {
      reply.status(CLIENT_ERROR).send({
        message: error.message,
      });
      logger.error("Error in delete module handler", error.message);
    } else {
      logger.error("Error in delete module handler", "unknown error");
    }
  }
};
export const moduleHandler = {
  createModule,
  getModuleByDirectionId,
  editModule,
  deleteModule,
};
