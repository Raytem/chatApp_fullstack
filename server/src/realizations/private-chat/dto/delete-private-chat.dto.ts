import { ApiProperty } from '@nestjs/swagger';

export class DeletePrivateChatDto {
  @ApiProperty()
  chatId: number;

  @ApiProperty()
  isFullDelete: boolean;
}
