import { db } from "db";
import { scheduleToUsersEntity } from "db/entities/schedule/schedule-to-users.entity";
import {
  scheduleCanceledEntity,
  scheduleEntity,
  scheduleTransferEntity,
} from "db/entities/schedule/schedule.entity";
import { userEntity } from "db/entities/user/user.entity";
import { workingDayEntity } from "db/entities/working/working-day.entity";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import {
  IScheduleAttachDto,
  IScheduleCanceledDto,
  IScheduleDataDto,
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
import { userService } from "services/user/user-service";
import { InferSelectModel } from "drizzle-orm";

type ScheduleWithStudents = InferSelectModel<typeof scheduleEntity> & {
  students: InferSelectModel<typeof userEntity>[];
};
function getNextWorkingDay(date: Date, firstDayOfWeek: number): Date {
  const dayOfWeek = date.getDay();
  const diff = (firstDayOfWeek - dayOfWeek + 7) % 7;
  const nextWorkingDay = new Date(date);
  nextWorkingDay.setDate(nextWorkingDay.getDate() + diff);
  return nextWorkingDay;
}

function getWorkingDaysTeacher(
  firstWorkingDay: Date,
  workingDays: number[]
): Date[] {
  const workingDaysArray: Date[] = [];
  for (let i: number = 0; i < workingDays.length; i++) {
    const day: Date = new Date(firstWorkingDay);
    day.setDate(day.getDate() + i);
    if (workingDays.includes(day.getDay())) {
      workingDaysArray.push(day);
    }
  }
  return workingDaysArray;
}
const createSchedule = async (data: IScheduleDto, userId: string) => {
  const teacher = await userService.findUserById(userId);
  if (!teacher) {
    throw new Error("Teacher does not exist");
  }

  const scheduledData: IScheduleDataDto[] = [];
  const firstWorkingDay: Date = getNextWorkingDay(
    new Date(),
    data.workingDays[0]
  );
  const workingDays: Date[] = getWorkingDaysTeacher(
    firstWorkingDay,
    data.workingDays
  );

  workingDays.forEach((day: Date) => {
    data.timeIntervals.forEach(
      (interval: { startTime: string; endTime: string }) => {
        scheduledData.push({
          startTime: interval.startTime,
          endTime: interval.endTime,
          dateLesson: day,
          userId: teacher.id,
          status: EScheduleStatus.SCHEDULED,
        });
      }
    );
  });

  const [schedule] = await db
    .insert(scheduleEntity)
    .values(scheduledData)
    .returning();
  return schedule;
};

const getSchedule = async (
  data: IScheduleGetByDate,
  userId: string
): Promise<ScheduleWithStudents[]> => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  end.setHours(23, 59, 59, 999);

  const scheduled = await db
    .select({
      schedule: scheduleEntity,
      student: userEntity,
    })
    .from(scheduleEntity)
    .leftJoin(
      scheduleToUsersEntity,
      eq(scheduleEntity.id, scheduleToUsersEntity.scheduleId)
    )
    .leftJoin(userEntity, eq(scheduleToUsersEntity.userId, userEntity.id))
    .where(
      and(
        eq(scheduleEntity.userId, userId),
        gte(scheduleEntity.dateLesson, start),
        lte(scheduleEntity.dateLesson, end)
      )
    )
    .orderBy(asc(scheduleEntity.dateLesson), asc(scheduleEntity.startTime));

  const scheduleMap = new Map<string, ScheduleWithStudents>();

  for (const { schedule, student } of scheduled) {
    if (!scheduleMap.has(schedule.id)) {
      scheduleMap.set(schedule.id, {
        ...schedule,
        students: [],
      });
    }
    if (student) {
      scheduleMap.get(schedule.id)!.students.push(student);
    }
  }

  return Array.from(scheduleMap.values());
};

const getScheduleForAdmin = async (data: IScheduleFilter) => {
  const { userId, startDate, endDate } = data;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const schedules = await db.query.scheduleEntity.findMany({
    where: (it) =>
      and(
        eq(it.userId, userId ?? ""),
        gte(it.dateLesson, start ?? ""),
        lte(it.dateLesson, end ?? "")
      ),
  });
  return schedules;
};
const getScheduleForStudent = async (
  data: IScheduleGetByDate,
  userId: string
) => {
  const { startDate, endDate } = data;
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const studentSchedules = await db
    .select({
      schedule: scheduleEntity,
      educator: userEntity,
    })
    .from(scheduleToUsersEntity)
    .leftJoin(
      scheduleEntity,
      eq(scheduleToUsersEntity.scheduleId, scheduleEntity.id)
    )
    .leftJoin(userEntity, eq(scheduleEntity.userId, userEntity.id))
    .where(
      and(
        eq(scheduleToUsersEntity.userId, userId),
        gte(scheduleEntity.dateLesson, start),
        lte(scheduleEntity.dateLesson, end)
      )
    );
  const scheduledMap = studentSchedules.map(({ schedule, educator }) => ({
    ...schedule,
    educator: educator || null,
  }));
  return scheduledMap;
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
    throw new Error("Новая дата урока не может быть раньше изначального");
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
const createWorkingDays = async () => {
  const data = [
    { dayName: "Понедельник", dayNumber: 1 },
    { dayName: "Вторник", dayNumber: 2 },
    { dayName: "Среда", dayNumber: 3 },
    { dayName: "Четверг", dayNumber: 4 },
    { dayName: "Пятница", dayNumber: 5 },
    { dayName: "Суббота", dayNumber: 6 },
    { dayName: "Воскресенье", dayNumber: 0 },
  ];

  await db.insert(workingDayEntity).values(data);
};
const attachStudentToSchedule = async (
  data: IScheduleAttachDto,
  userId: string
) => {
  const schedule = await getScheduleById(data.scheduleId);

  const existingStudents = await db
    .select()
    .from(scheduleToUsersEntity)
    .where(eq(scheduleToUsersEntity.scheduleId, schedule.id));

  if (existingStudents.length >= 8) {
    throw new Error("Группа не может быть больше 8 человек");
  }

  const alreadyExists = existingStudents.some(
    (student) => student.userId === userId
  );

  if (alreadyExists) {
    throw new Error("Вы уже записаны на этот урок");
  }

  const [newEntry] = await db
    .insert(scheduleToUsersEntity)
    .values({
      scheduleId: data.scheduleId,
      userId: userId,
    })
    .returning();

  if (!newEntry) {
    throw new Error("Ошибка при записи на занятие");
  }

  return newEntry;
};
export const scheduleService = {
  createSchedule,
  getSchedule,
  getScheduleForAdmin,
  createScheduleTransfer,
  createScheduleCancel,
  updateScheduleCancel,
  updateScheduleTransfer,
  getScheduleById,
  getScheduleCancelById,
  updateSchedule,
  getWorkingDays,
  createWorkingDays,
  attachStudentToSchedule,
  getScheduleForStudent,
};
