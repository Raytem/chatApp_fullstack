import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { UserEntity } from 'src/realizations/user/entities/user.entity';

export class CreateOnlineStatusDto {
  @ApiProperty()
  @IsBoolean()
  isOnline: boolean;

  @ApiProperty({ type: UserEntity })
  user: UserEntity;
}
