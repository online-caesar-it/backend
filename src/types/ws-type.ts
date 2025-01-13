import { ChatEvents } from "enums/chat/events";

export type TChatSendMessagesWs = {
  event: ChatEvents.SEND_MESSAGES;
  payload: {
    chatId: string;
    text: string;
  };
};
export type TChatGetMessagesWs = {
  event: ChatEvents.GET_MESSAGES;
  payload: {
    chatId: string;
    text: string;
  };
};
