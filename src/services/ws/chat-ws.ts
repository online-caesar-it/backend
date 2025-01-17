import { logger } from "lib/logger/logger";
import { IAuthenticatedRequest } from "types/req-type";
import { WebSocket } from "ws";
import { ChatEvents } from "enums/chat/events";
import { chatService } from "services/chat/chat.service";
import { TChatGetMessagesWs, TChatSendMessagesWs } from "types/ws-type";

const sendMessage = async (
  parsed: TChatSendMessagesWs,
  userId: string,
  clients: Map<string, { socket: WebSocket; userId: string }>
) => {
  if (!parsed.payload || !parsed.payload.chatId || !parsed.payload.text) {
    throw new Error("Invalid payload: 'chatId' and 'text' are required");
  }

  const { chatId, text } = parsed.payload;
  logger.info("Processing sendMessage", chatId);

  try {
    const newMessage = await chatService.sendMessage(userId, text, chatId);
    logger.info("Message successfully sent:", newMessage.text);

    for (const [id, client] of clients.entries()) {
      client.socket.send(
        JSON.stringify({ event: ChatEvents.NEW_MESSAGE, payload: newMessage })
      );
    }
  } catch (sendError) {
    logger.error("Error in chatService.sendMessage:", sendError as string);
  }
};
const getMessages = async (socket: WebSocket, parsed: TChatGetMessagesWs) => {
  if (!parsed.payload || !parsed.payload.chatId) {
    throw new Error("Invalid payload: 'chatId' is required");
  }

  const { chatId: requestedChatId, page, limit } = parsed.payload;
  logger.info("Processing getMessages", requestedChatId);

  try {
    const messages = await chatService.getMessages(
      requestedChatId,
      page,
      limit
    );

    socket.send(
      JSON.stringify({
        event: ChatEvents.NEW_MESSAGE,
        payload: messages,
      })
    );
  } catch (getError) {
    logger.error("Error in chatService.getMessages:", getError as string);
  }
};

const chatWebSocket = async (
  message: string,
  userId: string,
  socket: WebSocket,
  clients: Map<string, { socket: WebSocket; userId: string }>
) => {
  const messageStr = message.toString();
  try {
    const parsed = JSON.parse(messageStr);

    switch (parsed.event) {
      case ChatEvents.SEND_MESSAGES:
        sendMessage(parsed, userId, clients);
        break;
      case ChatEvents.NEW_MESSAGE:
        getMessages(socket, parsed);
        break;

      default:
        logger.warn("Unknown event type", parsed.event);
    }
  } catch (error) {
    logger.error("Error processing WebSocket message:", error as string);
  }
};
export const chatWebSocketService = {
  chatWebSocket,
};
