import { entities } from "enums/entities/entities";
import { logger } from "lib/logger/logger";
import { chatWebSocketService } from "services/ws/chat-ws";
import { IAuthenticatedRequest } from "types/req-type";
import { WebSocket } from "ws";

export const clients = new Map<string, { socket: WebSocket; userId: string }>();
const wsConnect = (socket: WebSocket, req: IAuthenticatedRequest) => {
  const clientId = req.headers["sec-websocket-key"] || Date.now().toString();
  const userId = req.user?.id as string;
  clients.set(clientId, { socket, userId });
  const { service } = req.query as {
    service: string;
  };
  logger.info("Client connected:", `${clientId}, ${userId}`);
  socket.on("message", async (message: string) => {
    switch (service) {
      case entities.CHAT:
        chatWebSocketService.chatWebSocket(message, userId, socket, clients);
    }
  });
  socket.on("close", () => {
    clients.delete(clientId);
    logger.info("Client disconnected:", clientId);
  });
};
export const wsHandler = {
  wsConnect,
};
