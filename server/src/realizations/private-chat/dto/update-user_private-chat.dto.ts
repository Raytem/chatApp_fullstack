import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { User_PrivateChatEntity } from 'src/realizations/user_private-chat/entities/user_private-chat.entity';

export class UpdateUser_PrivateChatDto extends PickType(
  PartialType(User_PrivateChatEntity),
  ['isPinned'],
) {}
