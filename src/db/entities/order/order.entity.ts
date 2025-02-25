import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { EOrderStatus } from "enums/order/order-status";

export const orderEntity = pgTable("order", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  phoneNumber: text("phone_number").notNull(),
  fio: text("fio").notNull(),
  email: text("email").notNull(),
  comment: text("comment"),
  status: text("status").default(EOrderStatus.PENDING).$type<EOrderStatus>(),
});
