import { pgTable, uuid } from "drizzle-orm/pg-core";
import { workingDayEntity } from "../working/working-day.entity";
import { userEntity } from "./user.entity";

export const userToWorkingDaysEntity = pgTable("educator_working_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => userEntity.id),
  workingDayId: uuid("working_day_id").references(() => workingDayEntity.id),
});
