import { userEntity } from "../../db/entities/user/user.entity";
import { db } from "../../db";
import { userConfigEntity } from "../../db/entities/user/user-config.entity";
import {
  IUserDto,
  IUserGetUsers,
  IUserWithWorkingDaysDto,
} from "../../dto/user-dto";
import {
  USER_EXISTING,
  USER_NOT_FOUND,
} from "../../consts/response-status/response-message";
import { and, eq, inArray } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { envConfig } from "env";
import { workingDayEntity } from "db/entities/working/working-day.entity";
import { userToWorkingDaysEntity } from "db/entities/user/user-to-working.entity";
import { log } from "lib/logger/logger";
import { IScheduleEditWorkingDay } from "dto/schedule.dto";
import { ROLE_EDUCATOR, ROLE_STUDENT } from "consts/role/role";
import { TClientUserUpdate } from "types/user-type";
import { userToDirectionEntity } from "db/entities/direction/user-to-direction.entity";
import { directionService } from "services/direction/direction-service";
const findUserByEmail = async (email: string) => {
  const [userConfig] = await db
    .select()
    .from(userConfigEntity)
    .where(eq(userConfigEntity.email, email));
  if (!userConfig) {
    return null;
  }

  const [user] = await db
    .select()
    .from(userEntity)
    .where(eq(userEntity.id, userConfig.userId || ""));

  return user ? { ...user, config: userConfig } : null;
};
const updateUserRefreshToken = async (userId: string, refreshToken: string) => {
  const [updatedUserConfig] = await db
    .update(userConfigEntity)
    .set({ refresh_token: refreshToken })
    .where(eq(userConfigEntity.userId, userId))
    .returning();

  if (!updatedUserConfig) {
    throw new Error("Failed to update refresh token");
  }

  return updatedUserConfig;
};
const findUserByRefresh = async (refresh: string) => {
  const [userConfig] = await db
    .select()
    .from(userConfigEntity)
    .where(eq(userConfigEntity.refresh_token, refresh));
  if (!userConfig) {
    throw new Error("User Config is not defined");
  }
  const user = await findUserById(userConfig.userId || "");
  return { userConfig, user };
};
const findUserById = async (id: string) => {
  const [user] = await db
    .select()
    .from(userEntity)
    .where(eq(userEntity.id, id));

  if (!user) {
    throw new Error(USER_NOT_FOUND);
  }

  return user;
};

const createUser = async (user: IUserDto) => {
  const findUser = await findUserByEmail(user.email);
  if (findUser) {
    throw new Error(USER_EXISTING);
  }
  const [userCreating] = await db
    .insert(userEntity)
    .values({
      firstName: user.firstName,
      surname: user.surname,
      patronymic: user.patronymic,
      avatar: user.avatar || "",
      role: user.role || "",
    })
    .returning();
  const refreshToken = jwt.sign({ id: userCreating.id }, envConfig.SECRET_KEY, {
    expiresIn: "30d",
  });
  const [userConfigCreating] = await db
    .insert(userConfigEntity)
    .values({
      email: user.email,
      userId: userCreating.id,
      phone_number: user.phone,
      refresh_token: refreshToken,
    })
    .returning();

  return {
    config: userConfigCreating,
    ...userCreating,
  };
};
const findWorkingDayUser = async (userId: string) => {
  const workingDaysUser = await db.query.userToWorkingDaysEntity.findMany({
    where: (it) => eq(it.userId, userId),
  });
  if (!workingDaysUser) {
    throw new Error("Working days user does not exist");
  }
  const workingIds = workingDaysUser
    .map((it) => it.workingDayId)
    .filter((it) => it !== null);

  const workingDays = await db.query.workingDayEntity.findMany({
    where: (it) => inArray(it.id, workingIds),
  });
  if (!workingDays) {
    throw new Error("Working days  does not exist");
  }
  return workingDays;
};
// const findWorkingDayByNumber = async (
//   workingDays: IUserWithWorkingDaysDto["workingDays"]
// ) => {
//   const workingDaysData = await db.query.workingDayEntity.findMany({
//     where: (it) => inArray(it.dayNumber, workingDays),
//   });
//   return workingDaysData;
// };
// const setWorkingDayToUser = async (
//   userId: string,
//   workingDays: IUserWithWorkingDaysDto["workingDays"]
// ) => {
//   const workingDaysData = await findWorkingDayByNumber(workingDays);

//   const newWorkingDaysIds = new Set(workingDaysData.map((day) => day.id));

//   return await db.transaction(async (trx) => {
//     const existingDays = await trx
//       .select()
//       .from(userToWorkingDaysEntity)
//       .where(eq(userToWorkingDaysEntity.userId, userId));
//     const existingWorkingDaysIds = new Set(
//       existingDays.map((day) => day.workingDayId)
//     );

//     const daysToDelete = [...existingWorkingDaysIds]
//       .filter((id) => !newWorkingDaysIds.has(id ?? ""))
//       .map((id) => String(id));

//     if (daysToDelete.length) {
//       await trx
//         .delete(userToWorkingDaysEntity)
//         .where(
//           and(
//             eq(userToWorkingDaysEntity.userId, userId),
//             inArray(userToWorkingDaysEntity.workingDayId, daysToDelete)
//           )
//         );
//     }

//     const daysToInsert = workingDaysData
//       .filter((day) => !existingWorkingDaysIds.has(day.id))
//       .map((day) => ({
//         userId: userId,
//         workingDayId: day.id,
//       }));

//     if (daysToInsert.length) {
//       await trx
//         .insert(userToWorkingDaysEntity)
//         .values(daysToInsert)
//         .returning();
//     }

//     return daysToInsert;
//   });
// };

const findAllUsers = async () => {
  const users = await db.select().from(userEntity);
  const usersConfig = await db.select().from(userConfigEntity);

  return users.map((user) => {
    const config = usersConfig.find((cfg) => cfg.userId === user.id);
    return config ? { ...user, email: config.email } : user;
  });
};

const getSelfService = async (userId: string) => {
  const user = await findUserById(userId);
  const userConfig = await db
    .select()
    .from(userConfigEntity)
    .where(eq(userConfigEntity.userId, userId))
    .then(([cfg]) => cfg);

  if (!userConfig) {
    throw new Error(USER_NOT_FOUND);
  }

  return {
    config: userConfig,
    ...user,
  };
};
const getAllService = async () => {
  const users = await findAllUsers();
  return users;
};
const deleteUserByEmail = async (email: string) => {
  const userConfig = await db.query.userConfigEntity.findFirst({
    where: (it) => eq(it.email, email),
  });
  if (!userConfig) {
    throw new Error("Пользователь с такой почтой не найден");
  }
  await db
    .delete(userToWorkingDaysEntity)
    .where(eq(userToWorkingDaysEntity.userId, userConfig.userId ?? ""));
  await db
    .delete(userConfigEntity)
    .where(eq(userConfigEntity.id, userConfig.id));
  await db.delete(userEntity).where(eq(userEntity.id, userConfig.userId ?? ""));
};
const getEducators = async (data: IUserGetUsers) => {
  const { limit = 10, offset = 0 } = data;

  const educators = await db.query.userEntity.findMany({
    where: (it) => eq(it.role, ROLE_EDUCATOR),
    limit: Number(limit),
    offset: Number(offset),
    with: {
      config: true,
    },
  });

  return educators;
};
const getStudents = async (data: IUserGetUsers) => {
  const { limit = 10, offset = 0 } = data;

  const students = await db.query.userEntity.findMany({
    where: (it) => eq(it.role, ROLE_STUDENT),
    limit: Number(limit),
    offset: Number(offset),
    with: {
      config: true,
    },
  });

  return students;
};
const updateUserService = async (data: TClientUserUpdate) => {
  return await db
    .update(userEntity)
    .set({
      firstName: data.firstName,
      surname: data.surname,
    })
    .where(eq(userEntity.id, data.userId));
};

const updateUserConfigService = async (data: TClientUserUpdate) => {
  return await db
    .update(userConfigEntity)
    .set({
      email: data.email,
      phone_number: data.phone_number,
      telegram: data.telegram,
      vkontakte: data.vkontakte,
    })
    .where(eq(userConfigEntity.userId, data.userId));
};
const setAccessToPortal = async (userId: string, isAccessToPortal: boolean) => {
  await db
    .update(userEntity)
    .set({
      isAccessToPortal,
    })
    .where(eq(userEntity.id, userId));
};
const getUsersWithDirection = async (userId: string) => {
  const directions = await db
    .select()
    .from(userToDirectionEntity)
    .where(eq(userToDirectionEntity.userId, userId));

  const result = await db
    .select()
    .from(userToDirectionEntity)
    .innerJoin(userEntity, eq(userToDirectionEntity.userId, userEntity.id))
    .where(
      and(
        inArray(
          userToDirectionEntity.directionId,
          directions.map((row) => row.directionId)
        ),
        eq(userToDirectionEntity.userId, userEntity.id)
      )
    );

  const uniqueUsers = new Set(result.map((row) => JSON.stringify(row.users)));

  return Array.from(uniqueUsers).map((userString) => JSON.parse(userString));
};
export const userService = {
  findUserByEmail,
  findUserById,
  createUser,
  findAllUsers,
  getSelfService,
  getAllService,
  findUserByRefresh,
  updateUserRefreshToken,
  // setWorkingDayToUser,
  // findWorkingDayByNumber,
  findWorkingDayUser,
  deleteUserByEmail,
  getEducators,
  updateUserConfigService,
  updateUserService,
  getStudents,
  setAccessToPortal,
  getUsersWithDirection,
};
