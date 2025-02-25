import { db } from "db";
import { orderEntity } from "db/entities/order/order.entity";
import { IOrderDto } from "dto/order-dto";

const create = async (data: IOrderDto) => {
  const [order] = await db.insert(orderEntity).values(data).returning();
  return order;
};

export const orderService = {
  create,
};
