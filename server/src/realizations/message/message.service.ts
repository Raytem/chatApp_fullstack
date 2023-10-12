import {
  ForbiddenException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageEntity } from './entities/message.entity';
import { MoreThan, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PrivateChatService } from '../private-chat/private-chat.service';
import { UserEntity } from '../user/entities/user.entity';
import { NoSuchMessageException } from 'src/exceptions/NoSuchMessage.exception';
import { UserService } from '../user/user.service';
import { MessageAndPrivateChat } from 'src/interfaces/message-and-privateChat.interface';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { PrivateChatEntity } from '../private-chat/entities/private-chat.entity';
import { take } from 'rxjs';
import { NoSuchPrivateChatException } from 'src/exceptions/NoSuchPrivateChat.exception';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrivateChatDto } from '../private-chat/dto/privateChat.dto';
import { WsUser } from '../../decorators/ws-user.decorator';
import { instanceToPlain } from 'class-transformer';
import { User_PrivateChatEntity } from '../user_private-chat/entities/user_private-chat.entity';
import { ChatMessagesAndCnt } from 'src/interfaces/chat-messages-and-cnt.interface';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,

    @InjectRepository(User_PrivateChatEntity)
    private user_privateChatRepository: Repository<User_PrivateChatEntity>,

    private paginationService: PaginationService,

    @Inject(forwardRef(() => PrivateChatService))
    private privateChatService: PrivateChatService,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async findMessages(
    chatId: number,
    reqUser: UserEntity,
    paginationDto: PaginationDto,
  ): Promise<ChatMessagesAndCnt> {
    const chat = await this.privateChatService.findOne(chatId, reqUser);
    const upr = await this.user_privateChatRepository.findOne({
      where: {
        chat: { id: chatId },
        user: { id: reqUser.id },
      },
      relations: {
        chat: true,
        user: true,
        lastMsgBeforeSoftDelete: true,
      },
    });

    let lastMsgBeforeSoftDeleteId = 0;
    if (upr.lastMsgBeforeSoftDelete) {
      lastMsgBeforeSoftDeleteId = upr.lastMsgBeforeSoftDelete.id;
    }

    const pagination = this.paginationService.getPagination(paginationDto);

    const allMsgsCnt = await this.messageRepository.count({
      where: {
        id: MoreThan(lastMsgBeforeSoftDeleteId),
        chat: { id: chatId },
      },
      relations: {
        chat: true,
      },
    });

    const chatMessages = await this.messageRepository.find({
      where: {
        id: MoreThan(lastMsgBeforeSoftDeleteId),
        chat: {
          id: chatId,
        },
      },
      order: {
        id: 'DESC',
      },
      ...pagination,
    });

    return {
      messages: chatMessages.reverse(),
      cnt: allMsgsCnt,
    };
  }

  async findPreLastChatMessage(chat: PrivateChatEntity | PrivateChatDto) {
    const lastChatMessages = await this.messageRepository.find({
      where: {
        chat: {
          id: chat.id,
        },
      },
      order: {
        id: 'DESC',
      },
      take: 2,
    });

    return lastChatMessages.length >= 2 ? lastChatMessages[1] : null;
  }

  async findLastChatMessage(chat: PrivateChatEntity | PrivateChatDto) {
    const lastChatMessages = await this.messageRepository.find({
      where: {
        chat: {
          id: chat.id,
        },
      },
      order: {
        id: 'DESC',
      },
      take: 1,
    });

    return lastChatMessages.length >= 1 ? lastChatMessages[0] : null;
  }

  async create(
    createMessageDto: CreateMessageDto,
    wsUser: UserEntity,
  ): Promise<MessageAndPrivateChat> {
    await this.privateChatService.checkIsMemberOfChat(
      createMessageDto.chatId,
      wsUser.id,
    );

    const removedChat =
      await this.privateChatService.findDeletedUser_privateChatByChatId(
        createMessageDto.chatId,
        wsUser,
        true,
      );

    if (removedChat) {
      await this.user_privateChatRepository.restore({
        id: removedChat.id,
      });
    }

    const chat = await this.privateChatService.findOne(
      createMessageDto.chatId,
      wsUser,
    );
    const newMessage = await this.messageRepository.save({
      text: createMessageDto.text,
      chat,
      user: wsUser,
    });

    const updatedChat = await this.privateChatService.update(
      {
        id: chat.id,
        lastMessage: newMessage,
      },
      wsUser,
      newMessage,
    );

    const resLastMessage = instanceToPlain(
      new MessageEntity(updatedChat.lastMessage),
    ) as MessageEntity;

    return {
      message: newMessage,
      chat: {
        id: updatedChat.id,
      },
    };
  }

  async findAll() {
    return await this.messageRepository.find();
  }

  async findOne(id: number) {
    const message = await this.messageRepository.findOneBy({ id });
    if (!message) {
      throw new NoSuchMessageException();
    }
    return message;
  }

  async update(
    updateMessageDto: UpdateMessageDto,
    wsUser: UserEntity,
  ): Promise<MessageAndPrivateChat> {
    const message = await this.messageRepository.findOne({
      where: {
        id: updateMessageDto.msgId,
      },
      relations: {
        user: true,
      },
    });

    if (!message) {
      throw new NoSuchMessageException();
    }

    if (message.user.id !== wsUser.id) {
      throw new ForbiddenException('You can edit only your messages');
    }

    await this.messageRepository.update(
      {
        id: updateMessageDto.msgId,
      },
      {
        ...message,
        isEdited: true,
        text: updateMessageDto.text,
      },
    );

    const chat = await this.privateChatService.findOne(
      updateMessageDto.chatId,
      wsUser,
    );
    const updatedMessage = await this.messageRepository.findOneBy({
      id: message.id,
    });

    const lastChatMessage = chat.lastMessage;

    if (lastChatMessage.id && lastChatMessage.id === updatedMessage.id) {
      await this.privateChatService.update(
        {
          id: updateMessageDto.chatId,
          lastMessage: updatedMessage,
        },
        wsUser,
      );

      return {
        message: updatedMessage,
        chat: {
          id: updateMessageDto.chatId,
        },
      };
    }

    return {
      message: updatedMessage,
      chat: {
        id: updateMessageDto.chatId,
      },
    };
  }

  async updateLastReadMsgForEachChatMember(
    chatId: number,
    prevLastReadMessageId: number,
    newLastReadMessage: MessageEntity,
  ) {
    await this.user_privateChatRepository.update(
      {
        chat: {
          id: chatId,
        },
        lastReadMessage: {
          id: prevLastReadMessageId,
        },
      },
      {
        lastReadMessage: newLastReadMessage,
      },
    );
  }

  async remove(
    deleteMessageDto: DeleteMessageDto,
    wsUser: UserEntity,
  ): Promise<MessageAndPrivateChat> {
    const message = await this.messageRepository.findOne({
      where: {
        id: deleteMessageDto.msgId,
      },
      relations: {
        user: true,
      },
    });

    if (!message) {
      throw new NoSuchMessageException();
    }

    if (message.user.id !== wsUser.id) {
      throw new ForbiddenException('You can delete only your messages');
    }

    const chat = await this.privateChatService.findOne(
      deleteMessageDto.chatId,
      wsUser,
    );
    const prevLastChatMessage = chat.lastMessage;

    if (prevLastChatMessage.id && prevLastChatMessage.id === message.id) {
      const newLastChatMessage = await this.findPreLastChatMessage(chat);

      await this.privateChatService.update(
        {
          id: chat.id,
          lastMessage: newLastChatMessage,
        },
        wsUser,
      );
      await this.updateLastReadMsgForEachChatMember(
        chat.id,
        prevLastChatMessage.id,
        newLastChatMessage,
      );
    }

    await this.messageRepository.delete(deleteMessageDto.msgId);

    const updatedChat = await this.privateChatService.findOne(chat.id, wsUser);
    const resLastMessage = instanceToPlain(
      new MessageEntity(updatedChat.lastMessage),
    ) as MessageEntity;

    return {
      message: message,
      chat: {
        id: updatedChat.id,
      },
    };
  }
}
