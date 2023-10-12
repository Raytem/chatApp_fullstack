import { CreateMessageDto } from "../dtos/message/CreateMessageDto";
import { DeleteMessageDto } from "../dtos/message/DeleteMessageDto";
import { UpdateMessageDto } from "../dtos/message/UpdateMessageDto";
import { ReadChatMsgsDto } from "../dtos/privateChat/ReadChatMsgsDto";
import { ChatOnlineInfo } from "./ChatOnlineInfo";
import { ConnectToChatDto } from "./ConnectToChatDto";
import { PrivateChat } from "./PrivateChat";
import { ReadMessagesResponse } from "./ReadMessagesResponse";
import { WsMessageResponse } from "./WsMessageResponse";
import { DeletedChatInfo } from './DeletedChatInfo';
import { DeleteChatDto } from "../dtos/privateChat/DeleteChatDto";
import { TypingStatusDto } from "../dtos/privateChat/TypingStatusDto";

export interface UsePrivateChatType {
  typingStatus: TypingStatusDto | undefined;
  setTypingStatus: (value: TypingStatusDto) => void;
  onlineStatusLog: ChatOnlineInfo | undefined;
  updatedChat: PrivateChat | undefined;
  deletedChatInfo: DeletedChatInfo | undefined;
  readMsgsResp: ReadMessagesResponse | undefined;
  newMsgResp: WsMessageResponse | undefined;
  setNewMsgResp: (value: WsMessageResponse | undefined) => void;
  updatedMsgResp: WsMessageResponse | undefined;
  removedMsgResp: WsMessageResponse | undefined;
  chatActions: {
    updateTypingStatus: (typingStatusDto: TypingStatusDto) => void,
    readChatMsgs: (readChatMsgsDto: ReadChatMsgsDto) => void,
    deleteChat: (deleteChatDto: DeleteChatDto) => void,
    sendMsg: (createMsgDto: CreateMessageDto) => void,
    updateMsg: (updateMsgDto: UpdateMessageDto) => void,
    removeMsg: (removeMsgDto: DeleteMessageDto) => void,
    connectToChat: (connectToChatDto: ConnectToChatDto) => void,
    leaveFromChat: (leaveFromChatDto: ConnectToChatDto) => void,
    disconnect: () => void,
  };
}