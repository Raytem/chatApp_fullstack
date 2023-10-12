import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { AbstractBaseEntity } from '../../abstractBase.entity';
import { PrivateChatEntity } from 'src/realizations/private-chat/entities/private-chat.entity';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { User_PrivateChatEntity } from 'src/realizations/user_private-chat/entities/user_private-chat.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('message')
export class MessageEntity extends AbstractBaseEntity {
  @ApiProperty()
  @Column()
  text: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @Column({ default: false })
  isRead: boolean;

  @ApiProperty()
  @Column({ default: false })
  isEdited: boolean;

  @ManyToOne(() => PrivateChatEntity, (chat) => chat.messages, {
    onDelete: 'CASCADE',
  })
  chat: PrivateChatEntity;

  @OneToMany(
    () => User_PrivateChatEntity,
    (user_PrivateChat) => user_PrivateChat.lastReadMessage,
  )
  user_PrivateChats: User_PrivateChatEntity[];

  @OneToMany(
    () => User_PrivateChatEntity,
    (user_PrivateChat) => user_PrivateChat.lastMsgBeforeSoftDelete,
  )
  user_PrivateChats_Deleted: User_PrivateChatEntity[];

  @ManyToOne(() => UserEntity, (user) => user.messages, { eager: true })
  @Transform(({ value }) => ({
    id: value.id,
    fullName: value.fullName,
  }))
  user: UserEntity;

  constructor(partial: Partial<MessageEntity>) {
    super();
    Object.assign(this, partial);
  }
}
