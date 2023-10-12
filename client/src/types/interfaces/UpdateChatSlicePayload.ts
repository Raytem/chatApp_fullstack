import { PrivateChat } from "./PrivateChat";

export interface UpdateChatSlicePayload {
  updatedChat: PrivateChat;
  curChat: PrivateChat;
  readMsgsIntersectEl_inView: boolean;
}