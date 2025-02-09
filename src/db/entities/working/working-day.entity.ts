import { pgTable, uuid, integer, text } from "drizzle-orm/pg-core";

export const workingDayEntity = pgTable("working_day", {
  id: uuid("id").defaultRandom().primaryKey(),
  dayNumber: integer("day_number").notNull(),
  dayName: text("day_name").notNull(),
});
