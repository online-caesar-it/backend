import { db } from "db";
import { scheduleEntity } from "db/entities/schedule/schedule.entity";
import { IScheduleDto } from "dto/schedule.dto";
import { EScheduleStatus } from "enums/schedule/schedule-status";
import { log } from "lib/logger/logger";
import { directionService } from "services/direction/direction-service";
import { userService } from "services/user/user-service";

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
  const lessonDates: string[] = [];
  for (let month = 0; month < duration; month++) {
    currentDate.setMonth(currentDate.getMonth() + 1);
    currentDate.setDate(1);

    data.workingDays.forEach((workingDay) => {
      let lessonDate = new Date(currentDate);
      let diff = (workingDay - lessonDate.getDay() + 7) % 7;
      lessonDate.setDate(lessonDate.getDate() + diff);

      if (!lessonDates.includes(lessonDate.toISOString().split("T")[0])) {
        lessonDates.push(lessonDate.toISOString().split("T")[0]);
      }
    });
  }
  const scheduledData = lessonDates.map((it) => ({
    startTime: data.startTime,
    endTime: data.endTime,
    dateLesson: new Date(it),
    teacherId: teacher.id,
    status: EScheduleStatus.SCHEDULED,
  }));
  await db.insert(scheduleEntity).values(scheduledData);
};

export const scheduleService = {
  createSchedule,
};
