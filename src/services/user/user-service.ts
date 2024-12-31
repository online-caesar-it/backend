import {
  findUserById,
  findUserConfigByUserId,
} from "../../services/auth/auth-service";

export const getSelfService = async (userId: string) => {
  const user = await findUserById(userId);
  const userConfig = await findUserConfigByUserId(userId);
  return {
    user,
    userConfig,
  };
};
