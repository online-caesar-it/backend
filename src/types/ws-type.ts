import { ChatEvents } from "enums/chat/events";

export type TChatSendMessagesWs = {
  event: ChatEvents.SEND_MESSAGES;
  payload: {
    chatId: string;
    text: string;
  };
};
export type TChatGetMessagesWs = {
  event: ChatEvents.NEW_MESSAGE;
  payload: {
    chatId: string;
    text: string;
    page: number;
    limit: number;
  };
};
