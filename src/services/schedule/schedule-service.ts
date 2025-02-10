import { IScheduleDto } from "dto/schedule.dto";
import { log } from "lib/logger/logger";
import { directionService } from "services/direction/direction-service";
import { userService } from "services/user/user-service";
const getNextAvailableDay = (
  currentDate: Date,
  workingDays: number[]
): Date => {
  let date = new Date(currentDate);
  date.setDate(date.getDate() + ((workingDays[0] - date.getDay() + 7) % 7));
  return date;
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
  const lessonDates: string[] = [];

  const monthsToCover = Math.ceil(duration / 4);

  for (let month = 0; month < monthsToCover; month++) {
    currentDate.setMonth(currentDate.getMonth() + 1);
    currentDate.setDate(1);

    data.workingDays.forEach((workingDay) => {
      let lessonDate = new Date(currentDate);
      let diff = (workingDay - currentDate.getDay() + 7) % 7;
      lessonDate.setDate(currentDate.getDate() + diff);

      if (!lessonDates.includes(lessonDate.toISOString().split("T")[0])) {
        lessonDates.push(lessonDate.toISOString().split("T")[0]);
      }
    });

    if (lessonDates.length >= duration) break;
  }

  log.info(`${lessonDates} LESSON`);
};

export const scheduleService = {
  createSchedule,
};
