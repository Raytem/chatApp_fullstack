import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/realizations/user/entities/user.entity';

export class SignUpResponse {
  @ApiProperty({ type: () => UserEntity })
  user: UserEntity;

  @ApiProperty()
  accessToken: string;
}
