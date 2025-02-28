import {
  CREATE_SUCCESS,
  SUCCESS,
} from "consts/response-status/response-status";
import { ILessonDto } from "dto/direction-dto";
import { FastifyReply } from "fastify";
import { lessonService } from "services/lesson/lesson-service";
import { IAuthenticatedRequest } from "types/req-type";
import { errorUtils } from "utils/error";

const createLesson = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as ILessonDto;
    const lesson = await lessonService.createLesson(data);
    reply.status(CREATE_SUCCESS).send(lesson);
  } catch (error) {
    errorUtils.replyError("error in create lesson", error, reply);
  }
};
const getLessonByModuleId = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = req.query as {
      id: string;
    };
    const data = await lessonService.getLessonByModuleId(id);
    reply.status(SUCCESS).send(data);
  } catch (error) {
    errorUtils.replyError("error in get lesson by module id", error, reply);
  }
};
const updateLesson = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const { id, name, description } = req.body as {
      id: string;
      name: string;
      description: string;
    };
    const data = await lessonService.updateLesson(id, name, description);
    reply.status(CREATE_SUCCESS).send(data);
  } catch (error) {
    errorUtils.replyError("error in update lesson", error, reply);
  }
};
const deleteLesson = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = req.body as {
      id: string;
    };
    const data = await lessonService.deleteLesson(id);
    reply.status(CREATE_SUCCESS).send(data);
  } catch (error) {
    errorUtils.replyError("error in delete lesson", error, reply);
  }
};
const getByLessonByDirection = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const userId = req.user?.id as string;
    const lessons = await lessonService.getLessonByUserId(userId);
    reply.status(SUCCESS).send(lessons);
  } catch (error) {
    errorUtils.replyError("error in getByLessonByDirection", error, reply);
  }
};
export const lessonHandler = {
  createLesson,
  deleteLesson,
  getLessonByModuleId,
  updateLesson,
  getByLessonByDirection,
};
