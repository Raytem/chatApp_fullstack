import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class TypingStatusDto {
  @ApiProperty()
  @IsBoolean()
  isTyping: boolean;

  @ApiProperty()
  @IsNumber()
  chatId: number;

  @ApiProperty()
  @IsNumber()
  userId: number;
}
