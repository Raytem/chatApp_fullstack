import { MsgInfo } from "./MsgInfo";

export interface ReadMessagesResponse {
  chatId: number,
  readMsgs: MsgInfo[];
}