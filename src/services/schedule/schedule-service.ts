import { db } from "db";
import {
  scheduleCanceledEntity,
  scheduleEntity,
  scheduleTransferEntity,
} from "db/entities/schedule/schedule.entity";
import { and, eq, gte, lte } from "drizzle-orm";
import {
  IScheduleCanceledDto,
  IScheduleDto,
  IScheduleFilter,
  IScheduleGetByDate,
  IScheduleTransferDto,
  IScheduleUpdateTransferCancelDto,
} from "dto/schedule.dto";
import {
  EScheduleStatus,
  EScheduleTransferStatus,
} from "enums/schedule/schedule-status";
import { directionService } from "services/direction/direction-service";
import { userService } from "services/user/user-service";
const generateScheduleDates = (startDate: Date, durationInMonths: number) => {
  const dates = [];

  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + durationInMonths);

  let dateIterator = new Date(startDate);

  while (dateIterator <= endDate) {
    dates.push(new Date(dateIterator));

    dateIterator.setDate(dateIterator.getDate() + 1);
  }

  return dates;
};
const createSchedule = async (data: IScheduleDto) => {
  const teacher = await userService.findUserById(data.teacherId);
  if (!teacher) {
    throw new Error("Teacher does not exist");
  }

  const working = await userService.findWorkingDayByNumber(data.workingDays);
  const workingUserDays = await userService.findWorkingDayUser(teacher.id);

  const isValidSchedule = working.toString() === workingUserDays.toString();
  if (!isValidSchedule) {
    throw new Error(
      "Расписание преподавателя не позволяет вести уроки в выбранные дни"
    );
  }

  const direction = await directionService.getDirectionById(data.directionId);
  if (!direction) {
    throw new Error("Направления не найдено");
  }
  const duration = direction.duration;
  let currentDate = new Date();

  const allDates = generateScheduleDates(currentDate, duration);
  const filteredDates = allDates.filter((date) => {
    const dayOfWeek = date.getDay();
    return data.workingDays.includes(dayOfWeek);
  });
  const scheduledData = filteredDates.map((it) => ({
    startTime: data.startTime,
    endTime: data.endTime,
    dateLesson: it,
    userId: teacher.id,
    status: EScheduleStatus.SCHEDULED,
    directionId: direction.id,
  }));

  await db.insert(scheduleEntity).values(scheduledData);
};
const getSchedule = async (data: IScheduleGetByDate, userId: string) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  end.setHours(23, 59, 59, 999);
  const scheduled = await db.query.scheduleEntity.findMany({
    where: (it) =>
      and(
        eq(it.userId, userId),
        gte(it.dateLesson, start),
        lte(it.dateLesson, end)
      ),
  });
  if (!scheduled) {
    throw new Error("Scheduled not found");
  }
  return scheduled;
};
const getScheduleForAdmin = async (data: IScheduleFilter) => {
  const { directionId, userId, startDate, endDate } = data;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const schedules = await db.query.scheduleEntity.findMany({
    where: (it) =>
      and(
        eq(it.directionId, directionId ?? ""),
        eq(it.userId, userId ?? ""),
        gte(it.dateLesson, start ?? ""),
        lte(it.dateLesson, end ?? "")
      ),
  });
  return schedules;
};
const getScheduleById = async (scheduleId: string) => {
  const scheduled = await db.query.scheduleEntity.findFirst({
    where: (it) => eq(it.id, scheduleId),
  });
  if (!scheduled) {
    throw new Error("Расписание не найдено");
  }
  return scheduled;
};
const createScheduleTransfer = async (
  data: IScheduleTransferDto,
  userId: string
) => {
  const scheduled = await getScheduleById(data.scheduleId);
  const newLessonDate = new Date(data.newDateLesson);
  const lessonDate = new Date(scheduled.dateLesson);
  if (newLessonDate < lessonDate) {
    throw new Error("Новая дата урока не может быть раньше");
  }
  const scheduleExistByDate = await getSchedule(
    {
      startDate: String(newLessonDate),
      endDate: String(newLessonDate),
    },
    userId
  );
  if (scheduleExistByDate.length !== 0) {
    throw new Error("На выбранную дату уже есть урок, выберите другую дату");
  }
  const [scheduleTransfer] = await db
    .insert(scheduleTransferEntity)
    .values({
      ...data,
      newDateLesson: new Date(data.newDateLesson),
      scheduleId: scheduled.id,
      requestByUserId: userId,
      newEndTime: data.newEndTime,
      newStartTime: data.newStartTime,
    })
    .returning();
  if (!scheduleTransfer) {
    throw new Error("Error create schedule transfer");
  }
  return scheduleTransfer;
};
const createScheduleCancel = async (
  data: IScheduleCanceledDto,
  userId: string
) => {
  const scheduled = await getScheduleById(data.scheduleId);
  const [scheduleCancel] = await db
    .insert(scheduleCanceledEntity)
    .values({
      ...data,
      requestByUserId: userId,
      scheduleId: scheduled.id,
    })
    .returning();
  if (!scheduleCancel) {
    throw new Error("Error create schedule cancel");
  }
  return scheduleCancel;
};
const getScheduleTransferById = async (id: string) => {
  const scheduleTransfer = await db.query.scheduleTransferEntity.findFirst({
    where: (it) => eq(it.id, id),
  });
  if (!scheduleTransfer) {
    throw new Error("Schedule transfer does not exist");
  }
  return scheduleTransfer;
};
const getScheduleCancelById = async (id: string) => {
  const scheduleCancel = await db.query.scheduleCanceledEntity.findFirst({
    where: (it) => eq(it.id, id),
  });
  if (!scheduleCancel) {
    throw new Error("Schedule cancel does not exist");
  }
  return scheduleCancel;
};
const updateSchedule = async (
  dateLesson: string,
  scheduleId: string,
  startTime: string,
  endTime: string,
  status: EScheduleStatus
) => {
  const schedule = await getScheduleById(scheduleId);
  const [updatedSchedule] = await db
    .update(scheduleEntity)
    .set({
      dateLesson: new Date(dateLesson),
      startTime,
      endTime,
      status,
    })
    .where(eq(scheduleEntity.id, schedule.id))
    .returning();
  return updatedSchedule;
};
const updateScheduleTransfer = async (
  data: IScheduleUpdateTransferCancelDto
) => {
  const schedule = await getScheduleTransferById(data.scheduleTransferId);
  const [transfer] = await db
    .update(scheduleTransferEntity)
    .set({
      status: data.status,
    })
    .where(eq(scheduleTransferEntity.id, schedule.id))
    .returning();
  const statusScheduled =
    transfer.status === EScheduleTransferStatus.APPROVED
      ? EScheduleStatus.MOVED
      : EScheduleStatus.SCHEDULED;
  const updatedSchedule = await updateSchedule(
    String(transfer.newDateLesson),
    schedule.scheduleId ?? "",
    transfer.newStartTime,
    transfer.newEndTime,
    statusScheduled
  );
  return {
    transfer,
    updatedSchedule,
  };
};
const updateScheduleCancel = async (data: IScheduleUpdateTransferCancelDto) => {
  const schedule = await getScheduleCancelById(data.scheduleTransferId);
  const [cancel] = await db
    .update(scheduleCanceledEntity)
    .set({
      status: data.status,
    })
    .where(eq(scheduleCanceledEntity.id, schedule.id))
    .returning();
  return cancel;
};
const getWorkingDays = async () => {
  const data = await db.query.workingDayEntity.findMany();
  return data;
};
export const scheduleService = {
  createSchedule,
  getSchedule,
  getScheduleForAdmin,
  createScheduleTransfer,
  createScheduleCancel,
  updateScheduleCancel,
  generateScheduleDates,
  updateScheduleTransfer,
  getScheduleById,
  getScheduleCancelById,
  updateSchedule,
  getWorkingDays,
};
