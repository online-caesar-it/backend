import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { userEntity } from "./user.entity";

export const userConfigEntity = pgTable("users_config", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid().references(() => userEntity.id),
  email: text("email"),
  phone_number: text("phone_number"),
});
