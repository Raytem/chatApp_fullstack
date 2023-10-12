import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class CreateRoleDto {
  @ApiProperty({
    enum: Role,
    enumName: 'Role',
  })
  @IsEnum(Role)
  name: Role;
}
