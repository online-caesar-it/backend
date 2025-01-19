import { userEntity } from "../../db/entities/user/user.entity";
import { db } from "../../db";
import { userConfigEntity } from "../../db/entities/user/user-config.entity";
import { IUserDto } from "../../dto/user-dto";
import { USER_NOT_FOUND } from "../../consts/response-status/response-message";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { envConfig } from "env";
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
};
