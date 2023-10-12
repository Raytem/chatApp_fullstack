import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { AbstractBaseEntity } from '../../abstractBase.entity';
import { MessageEntity } from 'src/realizations/message/entities/message.entity';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { User_PrivateChatEntity } from 'src/realizations/user_private-chat/entities/user_private-chat.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@Entity('privateChat')
export class PrivateChatEntity extends AbstractBaseEntity {
  @ApiProperty({ type: () => MessageEntity })
  @OneToOne(() => MessageEntity, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn()
  lastMessage: MessageEntity;

  @ApiProperty()
  @Column()
  isSelf: boolean;

  @OneToMany(
    () => User_PrivateChatEntity,
    (user_privateChat) => user_privateChat.chat,
  )
  user_privateChats: User_PrivateChatEntity[];

  @OneToMany(() => MessageEntity, (message) => message.chat)
  messages: MessageEntity[];

  constructor(partial: Partial<PrivateChatEntity>) {
    super();
    Object.assign(this, partial);
  }
}
