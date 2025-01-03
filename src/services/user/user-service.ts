import { entitiesUser } from "db/entities/user/entities-user";
import { db } from "../../db";
import {
  findUserById,
  findUserConfigByUserId,
} from "../../services/auth/auth-service";
import { entitiesUserConfig } from "db/entities/user/entities-user-config";
export const findAllUsers = async () => {
  const users = await db.select().from(entitiesUser);
  const usersConfig = await db.select().from(entitiesUserConfig);
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
