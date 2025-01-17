import {
  CREATE_SUCCESS,
  SUCCESS,
} from "consts/response-status/response-status";
import { FastifyReply } from "fastify";
import { lessonService } from "services/lesson/lesson-service";
import { IAuthenticatedRequest } from "types/req-type";
import { errorUtils } from "utils/error";

const createLesson = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const { name, description, moduleId } = req.body as {
      name: string;
      moduleId: string;
      description: string;
    };
    const lesson = await lessonService.createLesson(
      name,
      description,
      moduleId
    );
    reply.status(CREATE_SUCCESS).send(lesson);
  } catch (error) {
    errorUtils.replyError("error in create lesson", error, reply);
  }
};
export const lessonHandler = {
  createLesson,
};
