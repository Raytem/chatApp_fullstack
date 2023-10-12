import { PrivateChatEntity } from '../entities/private-chat.entity';
import { OnlineStatusEntity } from 'src/realizations/online-status/entities/online-status.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class OnlineInfo extends PickType(OnlineStatusEntity, [
  'isOnline',
  'lastActivity',
]) {
  @ApiProperty()
  userId: number;
}

export class PrivateChatDto extends PickType(PrivateChatEntity, [
  'id',
  'isSelf',
  'lastMessage',
]) {
  @ApiProperty()
  name: string;

  @ApiProperty()
  isPinned: boolean;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  membersCnt: number;

  @ApiProperty({ type: () => OnlineInfo })
  onlineInfo?: OnlineInfo;
}
