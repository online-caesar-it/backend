import { userEntity } from "../../db/entities/user/user.entity";
import { db } from "../../db";
import { userConfigEntity } from "../../db/entities/user/user-config.entity";
import { IUserDto } from "../../dto/user-dto";
import { USER_NOT_FOUND } from "../../consts/response-status/response-message";
import { eq } from "drizzle-orm";

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
      role: "user",
    })
    .returning();

  const [userConfigCreating] = await db
    .insert(userConfigEntity)
    .values({
      email: user.email,
      userId: userCreating.id,
      phone_number: user.phone,
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
    ...user,
    ...userConfig,
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
};
