import { UNKNOW_ERROR } from "consts/response-status/response-message";
import { CLIENT_ERROR, SUCCESS } from "consts/response-status/response-status";
import { IChatDto, IMessageDto } from "dto/chat-dto";
import { ChatType } from "enums/chat/events";
import { FastifyReply } from "fastify";
import { logger } from "lib/logger/logger";
import { chatService } from "services/chat/chat.service";
import { IAuthenticatedRequest } from "types/req-type";
import { errorUtils } from "utils/error";

const getMyChatsHandler = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const userId = req?.user?.id;
    const { search } = req.query as {
      search: string;
    };
    const chats = await chatService.getMyChats(userId || "", search);
    reply.status(SUCCESS).send(chats);
  } catch (error) {
    errorUtils.replyError("error in get chats", error, reply);
  }
};
const createChat = async (req: IAuthenticatedRequest, reply: FastifyReply) => {
  try {
    const data = req.body as IChatDto;
    const chat = await chatService.createChat(data);
    reply.status(SUCCESS).send(chat);
  } catch (error) {
    if (error instanceof Error) {
      logger.error("error in createChatHandler", error.message);
      reply.status(CLIENT_ERROR).send({
        message: error,
      });
    } else {
      logger.error("error in createChatHandler", UNKNOW_ERROR);
    }
  }
};
const sendMessage = async (req: IAuthenticatedRequest, reply: FastifyReply) => {
  try {
    const data = req.body as IMessageDto;
    const userId = req?.user?.id as string;
    const message = await chatService.sendMessage(data, userId);
    return message;
  } catch (error) {
    errorUtils.replyError("error in send message", error, reply);
  }
};
const getMessages = async (req: IAuthenticatedRequest, reply: FastifyReply) => {
  const {
    chatId,
    cursor = 1,
    limit,
    offset,
  } = req.query as {
    chatId: string;
    cursor: number;
    limit: string;
    offset: number;
    search: string;
  };

  try {
    const messages = await chatService.getMessages(
      chatId,
      cursor,
      parseInt(limit),
      offset
    );
    reply.status(SUCCESS).send(messages);
  } catch (err) {
    errorUtils.replyError("error in get message", err, reply);
  }
};
const searchMessages = async (
  req: IAuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const { chatId, search } = req.query as {
      search: string;
      chatId: string;
    };
    const messages = await chatService.searchMessages(chatId, search);
    reply.status(SUCCESS).send(messages);
  } catch (error) {
    errorUtils.replyError("error in searchMessages", error, reply);
  }
};
export const chatHandlers = {
  getMyChatsHandler,
  createChat,
  sendMessage,
  getMessages,
  searchMessages,
};
