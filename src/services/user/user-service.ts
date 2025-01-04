import { userEntity } from "../../db/entities/user/user.entity";
import { db } from "../../db";
import { userConfigEntity } from "../../db/entities/user/user-config.entity";
import { IUserDto } from "../../dto/user-dto";
import { USER_NOT_FOUND } from "../../consts/response-status/response-message";
import { eq } from "drizzle-orm";

const findUserConfigByUserId = async (userId: string) => {
  const [user] = await db
    .select()
    .from(userConfigEntity)
    .where(eq(userConfigEntity.userId, userId));
  return user;
};

const findUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(userConfigEntity)
    .where(eq(userConfigEntity.email, email));
  return user;
};

const findUserById = async (id: string) => {
  const [user] = await db
    .select()
    .from(userEntity)
    .where(eq(userEntity.id, id));
  if (!user) {
    throw new Error(USER_NOT_FOUND);
  }
  console.log(user);
  return user;
};

const createUser = async (user: IUserDto) => {
  const [userCreating] = await db
    .insert(userEntity)
    .values({
      firstName: user.firstName,
      lastName: user.lastName,
      secondName: user.secondName,
      avatar: user.avatar,
      role: user.role,
    })
    .returning();
  const [userCreatingConfig] = await db
    .insert(userConfigEntity)
    .values({
      email: user.email,
      userId: userCreating.id,
      password: user.password,
    })
    .returning();
  return { userCreating, userCreatingConfig };
};

const findAllUsers = async () => {
  const users = await db.select().from(userEntity);
  const usersConfig = await db.select().from(userConfigEntity);
  return users
    .flatMap((user) => {
      const configs = usersConfig.map((config) => {
        if (config.userId === user.id) {
          return {
            ...config,
            ...user,
          };
        }
      });
      return configs;
    })
    .filter(Boolean);
};

const getSelfService = async (userId: string) => {
  const user = await findUserById(userId);
  const userConfig = await findUserConfigByUserId(userId);
  return {
    user,
    userConfig,
  };
};

const getAllService = async () => {
  const users = await findAllUsers();
  return users;
};

export const userService = {
  findUserConfigByUserId,
  findUserByEmail,
  findUserById,
  findAllUsers,
  getAllService,
  getSelfService,
  createUser,
};
