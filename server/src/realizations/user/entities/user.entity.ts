import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { AbstractBaseEntity } from '../../abstractBase.entity';
import { RoleEntity } from 'src/realizations/role/entities/role.entity';
import { Exclude, Expose, Transform } from 'class-transformer';
import { ProductEntity } from 'src/realizations/product/entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/enums/role.enum';
import { MessageEntity } from 'src/realizations/message/entities/message.entity';
import { PrivateChatEntity } from 'src/realizations/private-chat/entities/private-chat.entity';
import { FileEntity } from 'src/realizations/file/entities/file.entity';
import { OnlineStatusEntity } from 'src/realizations/online-status/entities/online-status.entity';
import { User_PrivateChatEntity } from 'src/realizations/user_private-chat/entities/user_private-chat.entity';

@Entity('user')
export class UserEntity extends AbstractBaseEntity {
  @ApiProperty()
  @Column('varchar', {
    unique: true,
  })
  name: string;

  @ApiProperty()
  @Column('varchar', { nullable: true })
  surname: string;

  @ApiProperty()
  @Column('varchar', { unique: true })
  email: string;

  @ApiProperty()
  @Column('date', { nullable: true })
  birthday: Date;

  @Exclude()
  @Column('varchar', { nullable: true })
  password: string;

  @ApiProperty({ type: FileEntity })
  @OneToOne(() => FileEntity, (avatar) => avatar.user, {
    eager: true,
  })
  @JoinColumn()
  @Transform(({value}) => value?.link)
  avatar: FileEntity;

  @ApiProperty({ type: OnlineStatusEntity })
  @OneToOne(() => OnlineStatusEntity, (onlineStatus) => onlineStatus.user, {
    eager: true,
    cascade: ['insert', 'update'],
  })
  @JoinColumn()
  onlineStatus: OnlineStatusEntity;

  @ApiProperty({ type: Role, isArray: true, enum: Role, enumName: 'Role' })
  @Transform(({ value }) => value.map((role) => role.name))
  @ManyToMany(() => RoleEntity, (role) => role.users, { eager: true })
  @JoinTable({ name: 'user_role' })
  roles: RoleEntity[];

  @OneToMany(() => ProductEntity, (product) => product.user)
  products: ProductEntity[];

  @OneToMany(() => MessageEntity, (message) => message.user)
  messages: MessageEntity[];

  @OneToMany(
    () => User_PrivateChatEntity,
    (user_privateChat) => user_privateChat.user,
  )
  user_privateChats: User_PrivateChatEntity[];

  @ApiProperty({ name: 'fullName', type: 'string' })
  @Expose()
  get fullName(): string {
    return `${this.name} ${this.surname}`;
  }

  constructor(partial?: Partial<UserEntity>) {
    super();
    Object.assign(this, partial);
  }
}
