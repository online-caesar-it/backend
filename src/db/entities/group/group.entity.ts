import { pgTable, uuid } from "drizzle-orm/pg-core";
import { userEntity } from "../user/user.entity";
import { directionsToGroupsEntity } from "../direction/direction.entity";
import { relations } from "drizzle-orm";

export const groupEntity = pgTable("group", {
  id: uuid("id").primaryKey().defaultRandom(),
  educatorId: uuid("educator_id")
    .notNull()
    .references(() => userEntity.id),
});
export const groupRelations = relations(groupEntity, ({ one, many }) => ({
  educator: one(userEntity),
  directions: one(directionsToGroupsEntity),
  users: many(userEntity),
}));
