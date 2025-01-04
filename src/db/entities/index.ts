import { userEntity } from "./user/user.entity";
import { userConfigEntity } from "./user/user-config.entity";

export const entities = {
  ...userEntity,
  ...userConfigEntity,
};
