import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { lessonEntity } from "../lesson/lesson.entity";
import { groupEntity } from "../group/group.entity";
import { relations } from "drizzle-orm";
import { userEntity } from "../user/user.entity";

export const scheduleEntity = pgTable("schedule", {
  id: uuid("id").primaryKey().defaultRandom(),
  dateLesson: timestamp("date_lesson").notNull(),
  lessonId: uuid("lessonId").references(() => lessonEntity.id),
  groupId: uuid("groupId").references(() => groupEntity.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").default("scheduled"),
  teacherId: uuid("teacher_id").references(() => userEntity.id),
  createdAt: timestamp("created_at").defaultNow(),
});
export const scheduleTransferEntity = pgTable("schedule_transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  scheduleId: uuid("scheduled_id").references(() => scheduleEntity.id),
  requestByUserId: uuid("request_by_user_id").references(() => userEntity.id),
  reason: text("reason").notNull(),
  status: text("status").notNull(),
  newStartTime: timestamp("new_start_time").notNull(),
  newEndTime: timestamp("new_end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const scheduleCanceledEntity = pgTable("schedule_canceled", {
  id: uuid("id").primaryKey().defaultRandom(),
  scheduleId: uuid("scheduled_id").references(() => scheduleEntity.id),
  requestByUserId: uuid("request_by_user_id").references(() => userEntity.id),
  reason: text("reason").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const scheduleRelations = relations(scheduleEntity, ({ one }) => ({
  lesson: one(lessonEntity, {
    fields: [scheduleEntity.lessonId],
    references: [lessonEntity.id],
  }),
  group: one(groupEntity, {
    fields: [scheduleEntity.groupId],
    references: [groupEntity.id],
  }),
}));
export const scheduleTransferRelations = relations(
  scheduleTransferEntity,
  ({ one }) => ({
    user: one(userEntity, {
      fields: [scheduleTransferEntity.requestByUserId],
      references: [userEntity.id],
    }),
    schedule: one(scheduleEntity, {
      fields: [scheduleTransferEntity.scheduleId],
      references: [scheduleEntity.id],
    }),
  })
);
export const scheduleCanceledRelations = relations(
  scheduleCanceledEntity,
  ({ one }) => ({
    user: one(userEntity, {
      fields: [scheduleCanceledEntity.requestByUserId],
      references: [userEntity.id],
    }),
    schedule: one(scheduleEntity, {
      fields: [scheduleCanceledEntity.scheduleId],
      references: [scheduleEntity.id],
    }),
  })
);
// export const userScheduleRelations = relations(userEntity, ({ many }) => ({
//   schedules: many(scheduleToUsersEntity),
// }));
