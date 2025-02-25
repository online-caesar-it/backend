import { CREATE_SUCCESS } from "consts/response-status/response-status";
import { IOrderDto } from "dto/order-dto";
import { FastifyReply, FastifyRequest } from "fastify";
import { orderService } from "services/order/order.service";
import { errorUtils } from "utils/error";

const createOrder = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = req.body as IOrderDto;
    const order = await orderService.create(data);
    reply.status(CREATE_SUCCESS).send(order);
  } catch (error) {
    errorUtils.replyError("error in create order", error, reply);
  }
};

export const orderHandler = {
  createOrder,
};
