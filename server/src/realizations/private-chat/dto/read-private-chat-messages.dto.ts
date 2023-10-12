import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReadPrivateChatMessagesDto {
  @ApiProperty()
  @IsNumber()
  chatId: number;
}
