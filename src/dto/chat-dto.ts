import { ChatType } from "enums/chat/events";

export interface IChatDto {
  userIds: string[];
  name: string;
  description: string;
  type: ChatType;
}
export interface IMessageDto {
  chatId: string;
  text: string;
}
