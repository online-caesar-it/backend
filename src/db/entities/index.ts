import { entitiesUser } from "./user/entities-user";
import { entitiesUserConfig } from "./user/entities-user-config";

export const entities = {
  ...entitiesUser,
  ...entitiesUserConfig,
};
