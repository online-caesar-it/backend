import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { scheduleEntity } from "./schedule.entity";
import { userEntity } from "../user/user.entity";

export const scheduleToUsersEntity = pgTable("schedule_to_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  scheduleId: uuid("schedule_id")
    .notNull()
    .references(() => scheduleEntity.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => userEntity.id),
  role: text("role").notNull(),
});
