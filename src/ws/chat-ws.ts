import { FastifyInstance } from "fastify";
import { chatService } from "../services/chat/chat.service";
import { logger } from "lib/logger/logger";
import { IAuthenticatedRequest } from "types/req-type";
import { ChatEvents } from "enums/chat/events";
export const clients = new Map<string, { socket: any; userId: string }>();

export const chatWebSocket = (socket: any, req: IAuthenticatedRequest) => {
  const clientId = req.headers["sec-websocket-key"] || Date.now().toString();
  const userId = req.user?.id as string;
  console.log(userId, "userId");
  clients.set(clientId, { socket, userId });

  logger.info("Client connected:", `${clientId}, ${userId}`);

  socket.on("message", async (message: string) => {
    const messageStr = message.toString();
    try {
      const parsed = JSON.parse(messageStr);
      logger.info(`Message from ${clientId}:`, parsed);

      if (!parsed.event) {
        throw new Error("Missing 'event' field in message");
      }

      switch (parsed.event) {
        case ChatEvents.SEND_MESSAGES:
          if (
            !parsed.payload ||
            !parsed.payload.chatId ||
            !parsed.payload.text
          ) {
            throw new Error(
              "Invalid payload: 'chatId' and 'text' are required"
            );
          }

          const { chatId, text } = parsed.payload;
          logger.info("Processing sendMessage", chatId);

          try {
            const newMessage = await chatService.sendMessage(
              userId,
              text,
              chatId
            );
            logger.info("Message successfully sent:", newMessage.text);

            for (const [id, client] of clients.entries()) {
              client.socket.send(
                JSON.stringify({ event: "newMessage", payload: newMessage })
              );
            }
          } catch (sendError) {
            logger.error(
              "Error in chatService.sendMessage:",
              sendError as string
            );
          }
          break;
        case ChatEvents.GET_MESSAGES:
          if (!parsed.payload || !parsed.payload.chatId) {
            throw new Error("Invalid payload: 'chatId' is required");
          }

          const { chatId: requestedChatId } = parsed.payload;
          logger.info("Processing getMessages", requestedChatId);

          try {
            const messages = await chatService.getMessages(requestedChatId);

            socket.send(
              JSON.stringify({
                event: ChatEvents.GET_MESSAGES,
                payload: messages,
              })
            );
          } catch (getError) {
            logger.error(
              "Error in chatService.getMessages:",
              getError as string
            );
          }
          break;

        default:
          logger.warn("Unknown event type", parsed.event);
      }
    } catch (error) {
      logger.error("Error processing WebSocket message:", error as string);
      socket.send(
        JSON.stringify({
          event: "error",
          message: "Invalid message format or payload",
        })
      );
    }
  });

  socket.on("close", () => {
    clients.delete(clientId);
    logger.info("Client disconnected:", clientId);
  });
};
