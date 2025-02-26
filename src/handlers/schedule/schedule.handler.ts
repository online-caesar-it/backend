import { SCHEDULE_SUCCESS } from "consts/response-status/response-message";
import {
  CREATE_SUCCESS,
  SUCCESS,
} from "consts/response-status/response-status";
import { ROLE_EDUCATOR } from "consts/role/role";
import {
  IScheduleAttachDto,
  IScheduleByDirection,
  IScheduleByStatus,
  IScheduleCanceledDto,
  IScheduleDto,
  IScheduleEditWorkingDay,
  IScheduleFilter,
  IScheduleGetByDate,
  IScheduleGetByEducatorId,
  IScheduleLessonAttach,
  IScheduleTransferDto,
  IScheduleUpdateTransferCancelDto,
} from "dto/schedule.dto";
import { FastifyReply, FastifyRequest } from "fastify";
import { log } from "lib/logger/logger";
import { scheduleService } from "services/schedule/schedule-service";
import { userService } from "services/user/user-service";
import { IAuthenticatedRequest } from "types/req-type";
import { errorUtils } from "utils/error";

const createSchedule = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IScheduleDto;
    const userId = req.user?.id as string;
    const schedules = await scheduleService.createSchedule(data, userId);
    reply.send(CREATE_SUCCESS).send({
      message: SCHEDULE_SUCCESS,
      schedules,
    });
  } catch (error) {
    errorUtils.replyError("error in create schedule", error, reply);
  }
};
const getSchedule = async (req: IAuthenticatedRequest, reply: FastifyReply) => {
  try {
    const data = req.query as IScheduleGetByDate;
    const userId = req.user?.id as string;
    const user = await userService.findUserById(userId);
    let schedule: unknown = [];
    if (user.role === ROLE_EDUCATOR) {
      schedule = await scheduleService.getSchedule(data, userId);
    } else {
      schedule = await scheduleService.getScheduleForStudent(data, userId);
    }
    reply.status(SUCCESS).send(schedule);
  } catch (error) {
    errorUtils.replyError("error in get schedule", error, reply);
  }
};
const getScheduleEducator = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.query as IScheduleGetByEducatorId;
    const dates = {
      startDate: data.startDate,
      endDate: data.endDate,
    };
    const schedule = await scheduleService.getSchedule(dates, data.educatorId);
    reply.status(SUCCESS).send(schedule);
  } catch (error) {
    errorUtils.replyError("error in get schedule educator", error, reply);
  }
};
const editWorkingDays = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IScheduleEditWorkingDay;
    const userId = req.user?.id as string;
    // const workingDays = await userService.setWorkingDayToUser(
    //   userId,
    //   data.workingDays
    // );
    reply.status(SUCCESS).send();
  } catch (error) {
    errorUtils.replyError("error in edit working days", error, reply);
  }
};
const getSchedulesFilter = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.query as IScheduleFilter;
    const schedules = await scheduleService.getScheduleForAdmin(data);
    reply.status(SUCCESS).send(schedules);
  } catch (error) {
    errorUtils.replyError("error in getSchedulesFilter", error, reply);
  }
};
const createScheduleTransfer = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IScheduleTransferDto;
    const userId = req.user?.id as string;
    const transfer = await scheduleService.createScheduleTransfer(data, userId);
    reply.status(SUCCESS).send(transfer);
  } catch (error) {
    errorUtils.replyError("error in createScheduleTransfer", error, reply);
  }
};
const createScheduleCancel = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IScheduleCanceledDto;
    const userId = req.user?.id as string;
    const transfer = await scheduleService.createScheduleCancel(data, userId);
    reply.status(SUCCESS).send(transfer);
  } catch (error) {
    errorUtils.replyError("error in createScheduleCancel", error, reply);
  }
};
const updateScheduleTransfer = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IScheduleUpdateTransferCancelDto;
    const transfer = await scheduleService.updateScheduleTransfer(data);
    reply.status(SUCCESS).send(transfer);
  } catch (error) {
    errorUtils.replyError("error in updateScheduleTransfer", error, reply);
  }
};
const updateScheduleCancel = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IScheduleUpdateTransferCancelDto;
    const transfer = await scheduleService.updateScheduleCancel(data);
    reply.status(SUCCESS).send(transfer);
  } catch (error) {
    errorUtils.replyError("error in updateScheduleCancel", error, reply);
  }
};
const getWorkingDays = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await scheduleService.getWorkingDays();
    reply.status(SUCCESS).send(data);
  } catch (error) {
    errorUtils.replyError("error in getWorkingDays", error, reply);
  }
};
const createWorkingDays = async () => {
  try {
    const data = await scheduleService.createWorkingDays();
    return data;
  } catch (error) {
    log.error(`${error} in create working days`);
  }
};
const attachStudentToSchedule = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const userId = req.user?.id as string;
    const data = req.body as IScheduleAttachDto;
    const schedule = await scheduleService.attachStudentToSchedule(
      data,
      userId
    );
    reply.status(SUCCESS).send(schedule);
  } catch (error) {
    errorUtils.replyError("error in attachStudentToSchedule", error, reply);
  }
};
const getScheduleByDirection = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.query as IScheduleByDirection;
    const schedule = await scheduleService.getScheduleByDirection(data);
    reply.status(SUCCESS).send(schedule);
  } catch (error) {
    errorUtils.replyError("error in getScheduleByDirection", error, reply);
  }
};
const getScheduleTransferByStatus = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.query as IScheduleByStatus;
    const transfer = await scheduleService.getScheduleTransferByStatus(data);
    reply.status(SUCCESS).send(transfer);
  } catch (error) {
    errorUtils.replyError("error in getScheduleTransferByStatus", error, reply);
  }
};
const getScheduleCancelByStatus = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.query as IScheduleByStatus;
    const transfer = await scheduleService.getScheduleCancelByStatus(data);
    reply.status(SUCCESS).send(transfer);
  } catch (error) {
    errorUtils.replyError("error in getScheduleTransferByStatus", error, reply);
  }
};
const attachLesson = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IScheduleLessonAttach;
    const schedule = await scheduleService.attachLesson(data);
    reply.status(SUCCESS).send(schedule);
  } catch (error) {
    errorUtils.replyError("error in attachLesson", error, reply);
  }
};
const updateScheduleStatusEnd = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IScheduleAttachDto;
    const schedule = await scheduleService.updateScheduleStatusEnd(data);
    reply.status(SUCCESS).send(schedule);
  } catch (error) {
    errorUtils.replyError("error in updateScheduleStatusEnd", error, reply);
  }
};
export const scheduleHandler = {
  createSchedule,
  getSchedule,
  editWorkingDays,
  getSchedulesFilter,
  createScheduleTransfer,
  createScheduleCancel,
  updateScheduleCancel,
  updateScheduleTransfer,
  getWorkingDays,
  createWorkingDays,
  getScheduleEducator,
  attachStudentToSchedule,
  getScheduleByDirection,
  getScheduleCancelByStatus,
  getScheduleTransferByStatus,
  attachLesson,
  updateScheduleStatusEnd,
};
