import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/enums/role.enum';
import { AbstractBaseEntity } from '../../abstractBase.entity';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity('role')
export class RoleEntity extends AbstractBaseEntity {
  @ManyToMany(() => UserEntity, (user) => user.roles)
  users: UserEntity[];

  @ApiProperty({ enum: Role, enumName: 'Role' })
  @Column({
    type: 'enum',
    enum: Role,
  })
  name: Role;
}
