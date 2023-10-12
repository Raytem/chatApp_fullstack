import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { Tokens } from './tokens.interface';

export class UserData {
  @ApiProperty({ type: UserEntity })
  user: UserEntity;

  @ApiProperty({ type: Tokens })
  tokens: Tokens;
}
