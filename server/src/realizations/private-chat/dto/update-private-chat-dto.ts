import { PartialType, PickType } from '@nestjs/swagger';
import { PrivateChatEntity } from '../entities/private-chat.entity';

export class UpdatePrivateChatDto extends PartialType(
  PickType(PrivateChatEntity, ['lastMessage']),
) {}
