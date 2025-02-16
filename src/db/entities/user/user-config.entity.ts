import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { userEntity } from "./user.entity";
import { relations } from "drizzle-orm";

export const userConfigEntity = pgTable("users_config", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid().references(() => userEntity.id),
  email: text("email"),
  phone_number: text("phone_number"),
  refresh_token: text("refresh_token"),
});
