import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ConnectToChatResponseDto {
  @ApiProperty()
  @IsNumber()
  chatId: number;

  @ApiProperty()
  @IsNumber()
  connectedUserId: number;
}
