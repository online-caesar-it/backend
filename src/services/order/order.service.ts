import { db } from "db";
import { orderEntity } from "db/entities/order/order.entity";
import { IOrderDto } from "dto/order-dto";
import { tgBotService } from "services/tg-bot/tg-bot.service";

const create = async (data: IOrderDto) => {
  const [order] = await db.insert(orderEntity).values(data).returning();
  await tgBotService.sendTelegramAlert("info", "Новый заказ", order);
  return order;
};

export const orderService = {
  create,
};
