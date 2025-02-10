import { userEntity } from "../../db/entities/user/user.entity";
import { db } from "../../db";
import { userConfigEntity } from "../../db/entities/user/user-config.entity";
import { IUserDto, IWorkingDaysDto } from "../../dto/user-dto";
import {
  USER_EXISTING,
  USER_NOT_FOUND,
} from "../../consts/response-status/response-message";
import { eq, inArray } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { envConfig } from "env";
import { workingDayEntity } from "db/entities/working/working-day.entity";
import { userToWorkingDaysEntity } from "db/entities/user/user-to-working.entity";
import { log } from "lib/logger/logger";
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
const findWorkingDayByNumber = async (
  workingDays: IWorkingDaysDto["dayNumber"]
) => {
  const workingDaysData = await db.query.workingDayEntity.findMany({
    where: (it) => inArray(it.dayNumber, workingDays),
  });
  return workingDaysData;
};
const setWorkingDayToUser = async (
  userId: string,
  workingDays: IWorkingDaysDto
) => {
  const workingDaysData = await findWorkingDayByNumber(workingDays.dayNumber);

  const workingDaysToInsert = workingDaysData.map((workingDay) => ({
    userId: userId,
    workingDayId: workingDay.id,
  }));
  const data = await db
    .insert(userToWorkingDaysEntity)
    .values(workingDaysToInsert)
    .returning();
  return data;
};
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

export const userService = {
  findUserByEmail,
  findUserById,
  createUser,
  findAllUsers,
  getSelfService,
  getAllService,
  findUserByRefresh,
  updateUserRefreshToken,
  setWorkingDayToUser,
  findWorkingDayByNumber,
  findWorkingDayUser,
};
