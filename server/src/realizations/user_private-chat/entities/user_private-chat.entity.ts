import { AbstractBaseEntity } from '../../abstractBase.entity';
import { MessageEntity } from 'src/realizations/message/entities/message.entity';
import { PrivateChatEntity } from 'src/realizations/private-chat/entities/private-chat.entity';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { Column, DeleteDateColumn, Entity, ManyToOne } from 'typeorm';

@Entity('user_privateChat')
export class User_PrivateChatEntity extends AbstractBaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.user_privateChats, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ManyToOne(() => PrivateChatEntity, (chat) => chat.user_privateChats, {
    onDelete: 'CASCADE',
  })
  chat: PrivateChatEntity;

  @ManyToOne(() => MessageEntity, (message) => message.user_PrivateChats)
  lastReadMessage: MessageEntity;

  @ManyToOne(
    () => MessageEntity,
    (message) => message.user_PrivateChats_Deleted,
  )
  lastMsgBeforeSoftDelete: MessageEntity;

  @Column({ default: false })
  isPinned: boolean;

  @DeleteDateColumn()
  deletedAt: Date;
}
