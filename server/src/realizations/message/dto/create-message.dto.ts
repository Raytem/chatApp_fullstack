import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsNumber()
  chatId: number;

  @ApiProperty()
  @IsString()
  text: string;
}
