import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../abstractBase.entity';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { Column, Entity, OneToOne, UpdateDateColumn } from 'typeorm';

@Entity('onlineStatus')
export class OnlineStatusEntity extends AbstractBaseEntity {
  @ApiProperty()
  @Column()
  isOnline: boolean;

  @ApiProperty()
  @Column()
  @UpdateDateColumn()
  lastActivity: Date;

  @OneToOne(() => UserEntity, (user) => user.onlineStatus)
  user: UserEntity;
}
