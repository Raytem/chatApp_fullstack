import { ChatOnlineInfo } from "./ChatOnlineInfo";
import { Message } from "./Message";

export interface PrivateChat {
  id: number;
  isSelf: boolean;
  isPinned: boolean;
  lastMessage: Message;
  membersCnt: number;
  name: string;
  avatar: string;
  onlineInfo?: ChatOnlineInfo;
  isTyping?: boolean;
  unreadMsgsCnt: number;
}