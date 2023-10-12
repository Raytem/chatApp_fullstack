import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DeleteMessageDto {
  @ApiProperty()
  @IsNumber()
  msgId: number;

  @ApiProperty()
  @IsNumber()
  chatId: number;
}
