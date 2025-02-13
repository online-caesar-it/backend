import { db } from "db";
import { scheduleEntity } from "db/entities/schedule/schedule.entity";
import { and, eq, gte, lte } from "drizzle-orm";
import { IScheduleDto } from "dto/schedule.dto";
import { EScheduleStatus } from "enums/schedule/schedule-status";
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
    teacherId: teacher.id,
    status: EScheduleStatus.SCHEDULED,
  }));

  await db.insert(scheduleEntity).values(scheduledData);
};
const getScheduleByTeacher = async (
  teacherId: string,
  startDate: string,
  endDate: string
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const scheduled = await db.query.scheduleEntity.findMany({
    where: (it) =>
      and(
        eq(it.teacherId, teacherId),
        gte(it.dateLesson, start),
        lte(it.dateLesson, end)
      ),
  });
  if (!scheduled) {
    throw new Error("Scheduled not found");
  }
  return scheduled;
};

export const scheduleService = {
  createSchedule,
};
