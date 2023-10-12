export interface ReadMsgInfo {
  msgId: number;
  isRead: boolean;
}

export interface ReadMessagesResponse {
  chatId: number;
  readMsgs: ReadMsgInfo[];
}
