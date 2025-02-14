import { SCHEDULE_SUCCESS } from "consts/response-status/response-message";
import {
  CREATE_SUCCESS,
  SUCCESS,
} from "consts/response-status/response-status";
import {
  IScheduleCanceledDto,
  IScheduleDto,
  IScheduleEditWorkingDay,
  IScheduleFilter,
  IScheduleGetByDate,
  IScheduleTransferDto,
  IScheduleUpdateTransferCancelDto,
} from "dto/schedule.dto";
import { FastifyReply } from "fastify";
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
    await scheduleService.createSchedule(data);
    reply.send(CREATE_SUCCESS).send({
      message: SCHEDULE_SUCCESS,
    });
  } catch (error) {
    errorUtils.replyError("error in create schedule", error, reply);
  }
};
const getSchedule = async (req: IAuthenticatedRequest, reply: FastifyReply) => {
  try {
    const data = req.query as IScheduleGetByDate;
    const userId = req.user?.id as string;
    const schedule = await scheduleService.getSchedule(data, userId);
    reply.status(SUCCESS).send(schedule);
  } catch (error) {
    errorUtils.replyError("error in get schedule", error, reply);
  }
};
const editWorkingDays = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IScheduleEditWorkingDay;
    const userId = req.user?.id as string;
    const workingDays = await userService.setWorkingDayToUser(
      userId,
      data.workingDays
    );
    reply.status(SUCCESS).send(workingDays);
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
export const scheduleHandler = {
  createSchedule,
  getSchedule,
  editWorkingDays,
  getSchedulesFilter,
  createScheduleTransfer,
  createScheduleCancel,
  updateScheduleCancel,
  updateScheduleTransfer,
};
