import { userEntity } from "db/entities/user/user.entity";
import { db } from "../../db";
import {
  findUserById,
  findUserConfigByUserId,
} from "../../services/auth/auth-service";
import { userConfigEntity } from "db/entities/user/user-config.entity";
export const findAllUsers = async () => {
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
export const getSelfService = async (userId: string) => {
  const user = await findUserById(userId);
  const userConfig = await findUserConfigByUserId(userId);
  return {
    user,
    userConfig,
  };
};
export const getAllService = async () => {
  const users = await findAllUsers();
  return users;
};
