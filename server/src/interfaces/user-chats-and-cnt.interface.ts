import { PrivateChatDto } from 'src/realizations/private-chat/dto/privateChat.dto';

export interface UserChatsAndCnt {
  chats: PrivateChatDto[];
  cnt: number;
}
