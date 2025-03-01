import { db } from "db";
import { scheduleToUsersEntity } from "db/entities/schedule/schedule-to-users.entity";
import {
  scheduleCanceledEntity,
  scheduleEntity,
  scheduleTransferEntity,
} from "db/entities/schedule/schedule.entity";
import { userEntity } from "db/entities/user/user.entity";
import { workingDayEntity } from "db/entities/working/working-day.entity";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import {
  IScheduleAttachDto,
  IScheduleByDirection,
  IScheduleByStatus,
  IScheduleCanceledDto,
  IScheduleDataDto,
  IScheduleDto,
  IScheduleFilter,
  IScheduleGetByDate,
  IScheduleLessonAttach,
  IScheduleTransferDto,
  IScheduleUpdateTransferCancelDto,
} from "dto/schedule.dto";
import {
  EScheduleStatus,
  EScheduleTransferStatus,
} from "enums/schedule/schedule-status";
import { userService } from "services/user/user-service";
import { InferSelectModel } from "drizzle-orm";
import { userToDirectionEntity } from "db/entities/direction/user-to-direction.entity";
import { IUserByDirection } from "dto/direction-dto";
import { directionService } from "services/direction/direction-service";
import { ROLE_EDUCATOR, ROLE_STUDENT } from "consts/role/role";
import { lessonService } from "services/lesson/lesson-service";
import { lessonEntity } from "db/entities/lesson/lesson.entity";

type ScheduleWithStudents = InferSelectModel<typeof scheduleEntity> & {
  students: InferSelectModel<typeof userEntity>[];
  lesson?: InferSelectModel<typeof lessonEntity> | null;
};
function getNextWorkingDay(date: Date, targetDay: number): Date {
  const dayOfWeek = date.getDay();
  let diff = targetDay - dayOfWeek;
  if (diff <= 0) diff += 7;
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + diff);
  return nextDate;
}
const createSchedule = async (data: IScheduleDto, userId: string) => {
  const teacher = await userService.findUserById(userId);
  if (!teacher) {
    throw new Error("Teacher does not exist");
  }

  const scheduledData: IScheduleDataDto[] = [];
  const today = new Date();

  data.workingDays.forEach(({ day, timeIntervals }) => {
    const firstWorkingDay = getNextWorkingDay(today, day);

    timeIntervals.forEach(({ startTime, endTime, directionId }) => {
      scheduledData.push({
        startTime,
        endTime,
        dateLesson: firstWorkingDay,
        userId: teacher.id,
        status: EScheduleStatus.SCHEDULED,
        directionId,
      });
    });
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
      lesson: lessonEntity,
    })
    .from(scheduleEntity)
    .leftJoin(
      scheduleToUsersEntity,
      eq(scheduleEntity.id, scheduleToUsersEntity.scheduleId)
    )
    .leftJoin(userEntity, eq(scheduleToUsersEntity.userId, userEntity.id))
    .leftJoin(lessonEntity, eq(scheduleEntity.lessonId, lessonEntity.id))
    .where(
      and(
        eq(scheduleEntity.userId, userId),
        gte(scheduleEntity.dateLesson, start),
        lte(scheduleEntity.dateLesson, end),
        data.directionId
          ? eq(scheduleEntity.directionId, data.directionId)
          : undefined
      )
    )
    .orderBy(asc(scheduleEntity.dateLesson), asc(scheduleEntity.startTime));

  const scheduleMap = new Map<string, ScheduleWithStudents>();

  for (const { schedule, student, lesson } of scheduled) {
    if (!scheduleMap.has(schedule.id)) {
      scheduleMap.set(schedule.id, {
        ...schedule,
        students: [],
        lesson: lesson || null,
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
  const schedule = await getSchedule(
    {
      startDate,
      endDate,
    },
    userId
  );
  return schedule;
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
      lesson: lessonEntity,
    })
    .from(scheduleToUsersEntity)
    .leftJoin(
      scheduleEntity,
      eq(scheduleToUsersEntity.scheduleId, scheduleEntity.id)
    )
    .leftJoin(userEntity, eq(scheduleEntity.userId, userEntity.id))
    .leftJoin(lessonEntity, eq(scheduleEntity.lessonId, lessonEntity.id))
    .where(
      and(
        eq(scheduleToUsersEntity.userId, userId),
        gte(scheduleEntity.dateLesson, start),
        lte(scheduleEntity.dateLesson, end)
      )
    );
  const scheduledMap = studentSchedules.map(
    ({ schedule, educator, lesson }) => ({
      ...schedule,
      educator: educator || null,
      lesson: lesson || null,
    })
  );
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
  const user = await userService.findUserById(userId);
  if (user.role === ROLE_STUDENT) {
    const scheduleCancel = await scheduleService.updateSchedule(
      String(scheduled.dateLesson),
      scheduled.id,
      scheduled.startTime,
      scheduled.endTime,
      EScheduleStatus.CANCELED
    );
    await userService.incrementPendingLessonCount(
      [user.id],
      scheduled.directionId ?? ""
    );
    return {
      scheduleCancel,
      scheduled,
    };
  }
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
  status: EScheduleStatus,
  lessonId?: string
) => {
  const schedule = await getScheduleById(scheduleId);
  const [updatedSchedule] = await db
    .update(scheduleEntity)
    .set({
      dateLesson: new Date(dateLesson),
      startTime,
      endTime,
      status,
      lessonId: lessonId ?? schedule.lessonId,
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
  const scheduleCancel = await getScheduleCancelById(data.scheduleTransferId);
  const [cancel] = await db
    .update(scheduleCanceledEntity)
    .set({
      status: data.status,
    })
    .where(eq(scheduleCanceledEntity.id, scheduleCancel.id))
    .returning();
  const schedule = await getScheduleById(scheduleCancel.scheduleId ?? "");
  const statusScheduled =
    cancel.status === EScheduleTransferStatus.APPROVED
      ? EScheduleStatus.CANCELED
      : EScheduleStatus.SCHEDULED;
  const updatedSchedule = await updateSchedule(
    String(schedule.dateLesson),
    schedule.id ?? "",
    schedule.startTime,
    schedule.endTime,
    statusScheduled
  );
  const students = await db
    .select({ userId: scheduleToUsersEntity.userId })
    .from(scheduleToUsersEntity)
    .where(eq(scheduleToUsersEntity.scheduleId, schedule.id));

  const studentsUserIds = students.map((student) => student.userId);

  if (studentsUserIds.length > 0) {
    await userService.incrementPendingLessonCount(
      studentsUserIds,
      schedule.directionId ?? ""
    );
  }
  return {
    updatedSchedule,
    cancel,
  };
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
  if (!schedule.directionId) {
    throw new Error("У расписание нет направления");
  }
  const [userDirection] = await db
    .select()
    .from(userToDirectionEntity)
    .where(
      and(
        eq(userToDirectionEntity.userId, userId),
        eq(userToDirectionEntity.directionId, schedule.directionId)
      )
    );

  if (
    userDirection.pendingLessonCount !== null &&
    userDirection?.pendingLessonCount <= 0
  ) {
    throw new Error("У вас нет доступных уроков для записи");
  }

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

  await userService.decrementPendingLessonCount(
    [userId],
    userDirection.directionId
  );

  return newEntry;
};
const getScheduleByDirection = async (
  data: IScheduleByDirection,
  userId: string
) => {
  const educators = await directionService.getUserWithDirection({
    directionId: data.directionId,
    role: ROLE_EDUCATOR,
  });
  const userDirection = await db
    .select({ pendingLessonCount: userToDirectionEntity.pendingLessonCount })
    .from(userToDirectionEntity)
    .where(
      and(
        eq(userToDirectionEntity.userId, userId),
        eq(userToDirectionEntity.directionId, data.directionId)
      )
    )
    .then((rows) => rows[0] || { pendingLessonCount: 0 });
  const scheduleWithStudentsPromises = educators.map(async (educator) => {
    const schedule = await getSchedule(
      {
        startDate: data.startDate,
        endDate: data.endDate,
        directionId: data.directionId,
      },
      educator.id
    );

    return {
      educator,
      schedule: schedule.map((lesson) => ({
        ...lesson,
        availableLessons: userDirection.pendingLessonCount,
      })),
    };
  });

  const scheduleWithStudents = await Promise.all(scheduleWithStudentsPromises);

  return scheduleWithStudents;
};
const getScheduleTransferByStatus = async (data: IScheduleByStatus) => {
  const transfer = await db
    .select({
      scheduleId: scheduleTransferEntity.id,
      status: scheduleTransferEntity.status,
      requestByUserId: scheduleTransferEntity.requestByUserId,
      id: scheduleTransferEntity.id,
      reason: scheduleTransferEntity.reason,
      educator: {
        id: userEntity.id,
        firstName: userEntity.firstName,
        surname: userEntity.surname,
        avatar: userEntity.avatar,
        patronymic: userEntity.patronymic,
      },
    })
    .from(scheduleTransferEntity)
    .leftJoin(
      userEntity,
      eq(scheduleTransferEntity.requestByUserId, userEntity.id)
    )
    .where(eq(scheduleTransferEntity.status, data.status));
  return transfer;
};
const getScheduleCancelByStatus = async (data: IScheduleByStatus) => {
  const transfer = await db
    .select({
      scheduleId: scheduleCanceledEntity.id,
      status: scheduleCanceledEntity.status,
      requestByUserId: scheduleCanceledEntity.requestByUserId,
      id: scheduleCanceledEntity.id,
      reason: scheduleCanceledEntity.reason,
      educator: {
        id: userEntity.id,
        firstName: userEntity.firstName,
        surname: userEntity.surname,
        avatar: userEntity.avatar,
        patronymic: userEntity.patronymic,
      },
    })
    .from(scheduleCanceledEntity)
    .leftJoin(
      userEntity,
      eq(scheduleCanceledEntity.requestByUserId, userEntity.id)
    )
    .where(eq(scheduleCanceledEntity.status, data.status));
  return transfer;
};
const attachLesson = async (data: IScheduleLessonAttach) => {
  const lesson = await lessonService.getLessonById(data.lessonId);
  const schedule = await scheduleService.getScheduleById(data.scheduleId);
  await updateSchedule(
    String(schedule.dateLesson),
    schedule.id,
    schedule.startTime,
    schedule.endTime,
    schedule.status,
    lesson.id
  );
  return {
    updateSchedule,
    lesson,
  };
};
const updateScheduleStatusEnd = async (data: IScheduleAttachDto) => {
  const schedule = await getScheduleById(data.scheduleId);
  if (!schedule.lessonId) {
    throw new Error("Вы не можете завершить занятие, без прикрепленного урок");
  }
  if (schedule.status === EScheduleStatus.END) {
    throw new Error("Занятие уже завершено");
  }
  const direction = await directionService.getDirectionByLessonId(
    schedule.lessonId
  );
  const students = await db
    .select({ userId: scheduleToUsersEntity.userId })
    .from(scheduleToUsersEntity)
    .where(eq(scheduleToUsersEntity.scheduleId, data.scheduleId));
  const studentsUserIds = students.map((student) => student.userId);
  const userToDirection = await userService.decrementLessonCount(
    studentsUserIds,
    direction.id
  );
  for (const user of userToDirection) {
    const userDirections = await userService.getTotalAvailableLessons(
      user.userId
    );
    const allLessonsZero = userDirections.every(
      (dir) => dir.availableLessonCount === 0
    );
    if (allLessonsZero) {
      await directionService.deleteUserToDirectionAll(user.userId);
      await userService.setAccessToPortal(user.userId, false);
    }
  }
  const scheduleUpdated = await updateSchedule(
    String(schedule.dateLesson),
    schedule.id,
    schedule.startTime,
    schedule.endTime,
    EScheduleStatus.END
  );
  return scheduleUpdated;
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
  getScheduleByDirection,
  getScheduleTransferByStatus,
  getScheduleCancelByStatus,
  attachLesson,
  updateScheduleStatusEnd,
};
