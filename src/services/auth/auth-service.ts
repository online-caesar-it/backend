import bcrypt from "bcrypt";
import { IUserDto } from "../../dto/user-dto";
import { error } from "../../enums/error/error";
import { envConfig } from "../../env";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { entitiesUserConfig } from "../../db/entities/user/entities-user-config";
import { db } from "../../db";
import { entitiesUser } from "../../db/entities/user/entities-user";
import { USER_NOT_FOUND } from "../../consts/response-status/response-message";
export const findUserConfigByUserId = async (userId: string) => {
  try {
    const [user] = await db
      .select()
      .from(entitiesUserConfig)
      .where(eq(entitiesUserConfig.userId, userId));
    return user;
  } catch (error) {
    console.error("Произошла ошибка в методе findUserByConfigByUserId", error);
  }
};
export const findUserByEmail = async (email: string) => {
  try {
    const [user] = await db
      .select()
      .from(entitiesUserConfig)
      .where(eq(entitiesUserConfig.email, email));
    return user;
  } catch (error) {
    console.error("Произошла ошибка в методе findUserByEmail", error);
  }
};
export const findUserById = async (id: string) => {
  try {
    const [user] = await db
      .select()
      .from(entitiesUser)
      .where(eq(entitiesUser.id, id));
    if (!user) {
      throw new Error(USER_NOT_FOUND);
    }
    console.log(user);
    return user;
  } catch (error) {
    console.error("Произошла ошибка в методе findUserById", error);
  }
};
export const createUser = async (user: IUserDto) => {
  const [userCreating] = await db
    .insert(entitiesUser)
    .values({
      firstName: user.firstName,
      lastName: user.lastName,
      secondName: user.secondName,
      avatar: user.avatar,
      role: user.role,
    })
    .returning();
  const [userCreatingConfig] = await db
    .insert(entitiesUserConfig)
    .values({
      email: user.email,
      userId: userCreating.id,
      password: user.password,
    })
    .returning();
  return { userCreating, userCreatingConfig };
};

export const createAccessToken = async (id: string) => {
  const token = jwt.sign({ id: id }, String(envConfig.SECRET_KEY), {
    expiresIn: "1h",
  });

  return token;
};

export const registerService = async (user: IUserDto) => {
  const existingUser = await findUserByEmail(user.email);
  const passwordHash = await bcrypt.hash(user.password, 10);
  if (existingUser) {
    throw new Error(error.USER_EXIST);
  }
  const { userCreating, userCreatingConfig } = await createUser({
    ...user,
    password: passwordHash,
  });
  const token = await createAccessToken(userCreating.id);

  return { userCreating, token, userCreatingConfig };
};
export const loginService = async (user: IUserDto) => {
  const findUserConfig = await findUserByEmail(user.email);

  if (!findUserConfig) {
    throw new Error(error.USER_NOT_EXIST);
  }
  const findUser = await findUserById(findUserConfig.userId || "");
  console.log(findUserConfig);
  const isValidPassword = await bcrypt.compare(
    user.password,
    findUserConfig.password
  );

  if (!isValidPassword) {
    throw new Error(error.USER_NOT_VALID_PASSWORD);
  }
  const token = await createAccessToken(findUserConfig.userId || "");
  return { token, findUser, findUserConfig };
};
