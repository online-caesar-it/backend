import {
  CREATE_SUCCESS,
  SUCCESS,
} from "consts/response-status/response-status";
import { IScheduleDto } from "dto/schedule.dto";
import { FastifyReply } from "fastify";
import { scheduleService } from "services/schedule/schedule-service";
import { IAuthenticatedRequest } from "types/req-type";
import { errorUtils } from "utils/error";

const createSchedule = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const data = req.body as IScheduleDto;
    const scheduled = await scheduleService.createSchedule(data);
    reply.send(CREATE_SUCCESS).send(scheduled);
  } catch (error) {
    errorUtils.replyError("error in create schedule", error, reply);
  }
};

export const scheduleHandler = {
  createSchedule,
};
