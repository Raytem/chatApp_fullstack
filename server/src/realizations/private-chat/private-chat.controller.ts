import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { User } from 'src/decorators/req-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { PrivateChatService } from './private-chat.service';
import { CreatePrivateChatDto } from './dto/create-private-chat.dto';
import { GetPrivateChatDto } from './dto/get-private-chat.dto';
import { UserIdsDto } from './dto/user-Ids.dto';
import { UpdateUser_PrivateChatDto } from './dto/update-user_private-chat.dto';

@Controller('private-chat')
export class PrivateChatController {
  constructor(private privateChatService: PrivateChatService) {}

  @Get('memberIds/:member1_id/:member2_id')
  async findChatByMemberIds(
    @Param('member1_id') member1_id: number,
    @Param('member2_id') member2_id: number,
    @User() reqUser: UserEntity,
  ) {
    return this.privateChatService.findByMemberIds(
      [member1_id, member2_id],
      reqUser,
    );
  }

  @Patch(':chatId/forUser')
  async updateChatForUser(
    @Param('chatId') chatId: number,
    @Body() updateUser_privateChatDto: UpdateUser_PrivateChatDto,
    @User() reqUser: UserEntity,
  ) {
    console.log(updateUser_privateChatDto);
    return await this.privateChatService.updateChatForUser(
      chatId,
      reqUser,
      updateUser_privateChatDto,
    );
  }

  @Get(':chatId')
  async findOne(
    @Param('chatId', ParseIntPipe) chatId: number,
    @User() reqUser: UserEntity,
  ) {
    const chatsAndCnt = await this.privateChatService.getUserChats(
      reqUser.id,
      reqUser,
      chatId,
    );
    const chats = chatsAndCnt.chats;

    return chats.length ? chats[0] : [];
  }

  @Post()
  async create(
    @Body() createPrivateChatDto: CreatePrivateChatDto,
    @User() reqUser: UserEntity,
  ) {
    return await this.privateChatService.create(createPrivateChatDto, reqUser);
  }

  @Delete(':chatId')
  async remove(
    @Param('chatId', ParseIntPipe) chatId: number,
    @User() reqUser: UserEntity,
  ) {
    return await this.privateChatService.remove(chatId, reqUser);
  }
}
