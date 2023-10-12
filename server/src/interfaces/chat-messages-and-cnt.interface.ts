import { MessageEntity } from 'src/realizations/message/entities/message.entity';

export interface ChatMessagesAndCnt {
  messages: MessageEntity[];
  cnt: number;
}
