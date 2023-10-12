import { Message } from "./Message";

export interface WsMessageResponse {
  chatId: number,
  message: Message,
}