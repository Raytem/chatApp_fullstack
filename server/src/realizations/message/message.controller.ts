import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { User } from 'src/decorators/req-user.decorator';
import { MessageService } from './message.service';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import { Response } from 'express';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get('/private-chat/:chatId')
  async findChatMessages(
    @Param('chatId', ParseIntPipe) chatId: number,
    @User() reqUser: UserEntity,
    @Query() paginationDto: PaginationDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const messagesAndCnt = await this.messageService.findMessages(
      chatId,
      reqUser,
      paginationDto,
    );
    res.set('x-total-count', messagesAndCnt.cnt.toString());

    return messagesAndCnt.messages;
  }
}
