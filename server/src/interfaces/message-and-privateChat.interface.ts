import { MessageEntity } from 'src/realizations/message/entities/message.entity';

export interface MessageAndPrivateChat {
  message: MessageEntity;
  chat: {
    id: number;
  };
}
