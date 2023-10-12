import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GetPrivateChatDto {
  @ApiProperty()
  @IsNumber()
  chatId: number;
}
