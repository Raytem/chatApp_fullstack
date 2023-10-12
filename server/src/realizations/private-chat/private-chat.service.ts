import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { CreatePrivateChatDto } from './dto/create-private-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PrivateChatEntity } from './entities/private-chat.entity';
import { Not, Repository, createQueryBuilder } from 'typeorm';
import { NoSuchPrivateChatException } from 'src/exceptions/NoSuchPrivateChat.exception';
import { UserService } from 'src/realizations/user/user.service';
import { UserEntity } from '../user/entities/user.entity';
import { MessageEntity } from '../message/entities/message.entity';
import { UpdateUser_PrivateChatDto } from './dto/update-user_private-chat.dto';
import { PrivateChatDto } from './dto/privateChat.dto';
import { User_PrivateChatEntity } from '../user_private-chat/entities/user_private-chat.entity';
import { toUrl } from '../file/entities/file.entity';
import { NoSuchUserException } from 'src/exceptions/NoSuchUser.exception';
import { ReadPrivateChatMessagesDto } from './dto/read-private-chat-messages.dto';
import { ReadMessagesResponse } from 'src/interfaces/read-messages-response.interface';
import { PaginationService } from 'src/pagination/pagination.service';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import { UserChatsAndCnt } from 'src/interfaces/user-chats-and-cnt.interface';
import { UpdatePrivateChatDto } from './dto/update-private-chat-dto';
import { User_PrivateChatInfo } from 'src/interfaces/user_private-chat-info';
import { DeletePrivateChatDto } from './dto/delete-private-chat.dto';
import { MessageService } from '../message/message.service';
import { DeletedPrivateChatInfo } from 'src/interfaces/deleted-private-chat-info.interface';

@Injectable()
export class PrivateChatService {
  constructor(
    @InjectRepository(PrivateChatEntity)
    private prChatRepository: Repository<PrivateChatEntity>,

    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(User_PrivateChatEntity)
    private user_privateChatRepository: Repository<User_PrivateChatEntity>,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,

    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,

    private paginationService: PaginationService,
  ) {}

  async updateChatForUser(
    chatId: number,
    reqUser: UserEntity,
    updateUser_privateChatDto: UpdateUser_PrivateChatDto,
  ) {
    await this.checkIsMemberOfChat(chatId, reqUser.id);

    const updatedChat = await this.user_privateChatRepository
      .createQueryBuilder('upr')
      .leftJoin('upr.chat', 'chat')
      .leftJoin('upr.user', 'user')
      .update()
      .set({
        ...updateUser_privateChatDto,
      })
      .where('chat.id = :chatId', { chatId })
      .andWhere('user.id = :userId', { userId: reqUser.id })
      .execute();

    const chatsAndCnt = await this.getUserChats(reqUser.id, reqUser, chatId);
    const chats = chatsAndCnt.chats;

    return chats[0];
  }

  async getChatMembers(chatId: number, reqUser: UserEntity) {
    this.checkIsMemberOfChat(chatId, reqUser.id);

    const chatMembers = await this.userRepository
      .createQueryBuilder('user')
      .withDeleted()
      .leftJoin('user.user_privateChats', 'upr')
      .leftJoin('upr.chat', 'prChat')
      .where('prChat.id = :chatId', { chatId });

    return chatMembers.getMany();
  }

  async findDeletedUser_privateChatByChatId(
    chatId: number,
    reqUser: UserEntity,
    oppoUser = false,
  ) {
    const deletedUpr = await this.user_privateChatRepository.findOne({
      where: {
        chat: {
          id: chatId,
        },
        user: {
          id: oppoUser ? Not(reqUser.id) : reqUser.id,
        },
      },
      withDeleted: true,
      relations: {
        chat: true,
        user: true,
      },
    });

    return deletedUpr;
  }

  async findByMemberIds(userIds: number[], reqUser: UserEntity) {
    const chat = await this.prChatRepository
      .createQueryBuilder('prChat')
      .withDeleted()
      .leftJoin('prChat.user_privateChats', 'upr')
      .leftJoin('upr.user', 'user')
      .where('user.id = :userId_1', { userId_1: userIds[0] })
      .andWhere(
        `prChat.id IN (${this.prChatRepository
          .createQueryBuilder('prChat')
          .select('prChat.id')
          .leftJoin('prChat.user_privateChats', 'upr')
          .leftJoin('upr.user', 'user')
          .where(`user.id = ${userIds[1]}`)
          .getQuery()})`,
      )
      .getOne();

    if (chat) {
      await this.checkIsMemberOfChat(chat.id, reqUser.id);

      const deletedUpr = await this.findDeletedUser_privateChatByChatId(
        chat.id,
        reqUser,
      );
      if (deletedUpr) {
        await this.user_privateChatRepository.restore({
          id: deletedUpr.id,
        });
      }
    } else {
      throw new NoSuchPrivateChatException();
    }

    const chatsAndCnt = await this.getUserChats(reqUser.id, reqUser, chat.id);
    const chats = chatsAndCnt.chats;

    return chats[0];
  }

  async readChatMessages(
    readPrChatMsgsDto: ReadPrivateChatMessagesDto,
    reqUser: UserEntity,
  ): Promise<ReadMessagesResponse> {
    const curChat = await this.prChatRepository.findOneBy({
      id: readPrChatMsgsDto.chatId,
    });

    if (!curChat) {
      return;
    }

    const messages = await this.messageRepository.find({
      where: {
        user: {
          id: Not(reqUser.id),
        },
        chat: {
          id: readPrChatMsgsDto.chatId,
        },
        isRead: false,
      },
      relations: {
        user: true,
        chat: true,
      },
      order: {
        id: 'ASC',
      },
    });

    if (messages.length) {
      await this.messageRepository.update(
        {
          user: {
            id: Not(reqUser.id),
          },
          chat: {
            id: readPrChatMsgsDto.chatId,
          },
          isRead: false,
        },
        {
          isRead: true,
        },
      );
    }

    let lastMsgId;
    if (messages.length) {
      lastMsgId = messages.at(-1).id;
      const lastMsg = await this.messageRepository.findOneBy({ id: lastMsgId });

      await this.user_privateChatRepository.update(
        {
          user: { id: reqUser.id },
          chat: { id: readPrChatMsgsDto.chatId },
        },
        {
          lastReadMessage: lastMsg,
        },
      );
    }

    return {
      chatId: readPrChatMsgsDto.chatId,
      readMsgs: messages.map((msg) => ({ msgId: msg.id, isRead: true })),
    };
  }

  async create(
    createPrivateChatDto: CreatePrivateChatDto,
    reqUser: UserEntity,
  ): Promise<PrivateChatDto> {
    const userIdsSet = Array.from(new Set(createPrivateChatDto.userIds));

    const users = await this.userService.findByIds(userIdsSet);
    if (userIdsSet.length !== users.length) {
      throw new NoSuchUserException();
    }

    let isAllowed = false;

    if (userIdsSet.length === 1) {
      const chat = await this.user_privateChatRepository
        .createQueryBuilder('upr')
        .select('upr.chatId')
        .innerJoin('upr.chat', 'prChat', 'prChat.isSelf = true')
        .where('upr.userId = :userId', { userId: userIdsSet[0] })
        .getRawOne();

      if (!chat) {
        isAllowed = true;
      }
    } else {
      const chats = await this.user_privateChatRepository
        .createQueryBuilder('upr')
        .withDeleted()
        .select('upr.chatId')
        .where('upr.userId IN(:...userIds)', { userIds: userIdsSet })
        .groupBy('upr.chatId')
        .having('COUNT(upr.chatId) > 1')
        .getRawMany();

      if (!chats.length) {
        isAllowed = true;
      }
    }

    if (isAllowed) {
      const newChat = await this.prChatRepository.save({
        isSelf: userIdsSet.length === 1 ? true : false,
      });

      for (const user of users) {
        await this.user_privateChatRepository.save({
          user,
          chat: newChat,
        });
      }

      const chatsAndCnt = await this.getUserChats(
        reqUser.id,
        reqUser,
        newChat.id,
      );
      const chats = chatsAndCnt.chats;
      return chats[0];
    } else {
      throw new BadRequestException('chat already exists');
    }
  }

  async update(
    updatePrivateChatDto: UpdatePrivateChatDto,
    reqUser: UserEntity,
    lastReadMessage?: MessageEntity,
  ): Promise<PrivateChatDto> {
    const chat = await this.prChatRepository.findOneBy({
      id: updatePrivateChatDto.id,
    });
    if (!chat) {
      throw new NoSuchPrivateChatException();
    }
    updatePrivateChatDto;

    await this.checkIsMemberOfChat(chat.id, reqUser.id);

    await this.prChatRepository.update(
      { id: updatePrivateChatDto.id },
      {
        ...updatePrivateChatDto,
      },
    );

    if (lastReadMessage) {
      await this.user_privateChatRepository.update(
        {
          chat: {
            id: updatePrivateChatDto.id,
          },
          user: {
            id: reqUser.id,
          },
        },
        {
          lastReadMessage,
        },
      );
    }

    const chatsAndCnt = await this.getUserChats(reqUser.id, reqUser, chat.id);
    const chats = chatsAndCnt.chats;

    return chats[0];
  }

  async findPrivateChatIds(id: number, reqUser: UserEntity): Promise<number[]> {
    if (id !== reqUser.id) {
      throw new ForbiddenException('You can get only your chats');
    }

    const chats = await this.prChatRepository
      .createQueryBuilder('prChat')
      .withDeleted()
      .select('prChat.id')
      .leftJoin('prChat.user_privateChats', 'user_prChat')
      .leftJoin('user_prChat.user', 'user')
      .where('user.id = :userId', { userId: id })
      .getMany();

    return chats.map((chat) => chat.id);
  }

  async findAll() {
    return await this.prChatRepository.find();
  }

  async findOne(id: number, reqUser: UserEntity): Promise<PrivateChatDto> {
    const chat = await this.prChatRepository.findOneBy({ id });
    if (!chat) {
      throw new NoSuchPrivateChatException();
    }
    const chatsAndCnt = await this.getUserChats(reqUser.id, reqUser, chat.id);
    const chats = chatsAndCnt.chats;
    return chats[0];
  }

  async remove(id: number, reqUser: UserEntity) {
    const chat = await this.prChatRepository.findOneBy({ id });
    if (!chat) {
      throw new NoSuchPrivateChatException();
    }
    await this.checkIsMemberOfChat(chat.id, reqUser.id);
    await this.prChatRepository.delete(id);
    return chat;
  }

  async getUserChats(
    userId: number,
    reqUser: UserEntity,
    chatId = 0,
    paginationDto?: PaginationDto,
  ): Promise<UserChatsAndCnt> {
    if (chatId) {
      await this.checkIsMemberOfChat(chatId, userId);
    }
    const pagination = this.paginationService.getPagination(paginationDto);

    const user_privateChatInfo: User_PrivateChatInfo[] =
      await this.prChatRepository
        .createQueryBuilder('prChat')
        .select('prChat.id', 'id')
        .addSelect(
          'user_prChat.lastMsgBeforeSoftDeleteId',
          'lastMsgBeforeSoftDeleteId',
        )
        .addSelect('user_prChat.isPinned', 'isPinned')
        .addSelect((subqb1) => {
          return subqb1
            .select('COUNT(message.id)')
            .from(MessageEntity, 'message')
            .where('message.chatId = prChat.id')
            .andWhere(
              `message.id > COALESCE(
            (
              ${this.messageRepository
                .createQueryBuilder('message')
                .select('message.id')
                .where('message.id = "user_prChat"."lastReadMessageId"')
                .getQuery()}
            ),
            0
          )`,
            );
        }, 'unreadMsgsCnt')
        .leftJoin('prChat.user_privateChats', 'user_prChat')
        .where(':chatId = 0 AND prChat.id > 0', { chatId })
        .andWhere('user_prChat.userId = :userId', { userId })
        .orWhere(':chatId > 0 AND prChat.id = :chatId', { chatId })
        .andWhere('user_prChat.userId = :userId', { userId })
        .orderBy('user_prChat.isPinned', 'ASC')
        .orderBy('prChat.isSelf', 'DESC')
        .take(pagination.take)
        .skip(pagination.skip)
        .getRawMany();

    const chatId_user_PrivateChatInfo = new Map(
      user_privateChatInfo.map((chatInfo) => [+chatInfo.id, chatInfo]),
    );

    const allChatsCnt = await this.prChatRepository
      .createQueryBuilder('prChat')
      .leftJoinAndSelect('prChat.user_privateChats', 'user_prChat')
      .leftJoinAndSelect('user_prChat.user', 'user')
      .where('user.id = :userId', { userId })
      .getCount();

    const rawChats = await this.prChatRepository
      .createQueryBuilder('prChat')
      .withDeleted()
      .addSelect('user_prChat.isPinned', 'isPinned')
      .leftJoinAndSelect('prChat.user_privateChats', 'user_prChat')
      .leftJoinAndSelect('user_prChat.user', 'user')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .leftJoinAndSelect('prChat.lastMessage', 'lastMessage')
      .leftJoinAndSelect('user.onlineStatus', 'onlineStatus')
      .where('prChat.id IN(:...prChatId)', {
        prChatId: Array.from(chatId_user_PrivateChatInfo.keys()),
      })
      .orderBy('user_prChat.isPinned', 'ASC')
      .orderBy('prChat.isSelf', 'DESC')
      .take(pagination.take)
      .skip(pagination.skip)
      .getMany();

    const resChats = rawChats.map((chat) => {
      const chatMembers = chat.user_privateChats.map((upr) => upr.user);
      const privateChatDto: PrivateChatDto = {} as PrivateChatDto;

      const curChatInfo = chatId_user_PrivateChatInfo.get(chat.id);
      privateChatDto.membersCnt = chatMembers.length;

      if (chat.isSelf) {
        privateChatDto.name = 'Saved Messages';
        privateChatDto.avatar = process.env.IMG_SAVED_MESSAGES;
      } else if (chatMembers.length === 1 && !chat.isSelf) {
        privateChatDto.name = 'Deleted Account';
        privateChatDto.avatar = process.env.IMG_DELETED_ACCOUNT;
      } else if (chatMembers.length === 2 && !chat.isSelf) {
        const user = chatMembers.filter((m) => m.id !== userId)[0];
        privateChatDto.name = `${user.name} ${user.surname}`;
        privateChatDto.avatar =
          user.avatar?.link || process.env.IMG_BASE_AVATAR;
        privateChatDto.onlineInfo = {
          userId: user.id,
          isOnline: user.onlineStatus?.isOnline,
          lastActivity: user.onlineStatus?.lastActivity,
        };
      }

      if (
        chat.lastMessage &&
        chat.lastMessage.id === curChatInfo.lastMsgBeforeSoftDeleteId
      ) {
        privateChatDto.lastMessage = null;
      }

      return {
        ...chat,
        user_privateChats: undefined,
        ...privateChatDto,
        unreadMsgsCnt: +curChatInfo.unreadMsgsCnt,
        isPinned: curChatInfo.isPinned,
      };
    });

    return {
      chats: resChats,
      cnt: allChatsCnt,
    };
  }

  async checkIsMemberOfChat(chatId: number, userId: number) {
    const chat = await this.user_privateChatRepository
      .createQueryBuilder('upr')
      .withDeleted()
      .select('upr.id')
      .where('upr.userId = :userId', { userId })
      .andWhere('upr.chatId = :chatId', { chatId })
      .getOne();

    if (!chat) {
      throw new ForbiddenException('You are not a member of this chat');
    }
  }

  async delete(
    reqUser: UserEntity,
    deletePrivateChatDto: DeletePrivateChatDto,
  ): Promise<DeletedPrivateChatInfo> {
    await this.checkIsMemberOfChat(deletePrivateChatDto.chatId, reqUser.id);

    const chatMembers = await this.getChatMembers(
      deletePrivateChatDto.chatId,
      reqUser,
    );

    console.log(chatMembers);

    let userIdsToDelChat = [];
    userIdsToDelChat.push(...chatMembers.map((m) => m.id));

    if (deletePrivateChatDto.isFullDelete) {
      await this.user_privateChatRepository.delete({
        chat: {
          id: deletePrivateChatDto.chatId,
        },
      });

      await this.prChatRepository.delete({
        id: deletePrivateChatDto.chatId,
      });
    } else {
      userIdsToDelChat = userIdsToDelChat.filter(
        (userId) => userId === reqUser.id,
      );

      const chat = await this.prChatRepository.findOneBy({
        id: deletePrivateChatDto.chatId,
      });

      const lastChatMsg = await this.messageService.findLastChatMessage(chat);

      if (lastChatMsg) {
        await this.user_privateChatRepository.update(
          {
            chat: {
              id: deletePrivateChatDto.chatId,
            },
            user: {
              id: reqUser.id,
            },
          },
          {
            lastMsgBeforeSoftDelete: lastChatMsg,
            lastReadMessage: lastChatMsg,
          },
        );
      }

      await this.user_privateChatRepository.softDelete({
        chat: {
          id: deletePrivateChatDto.chatId,
        },
        user: {
          id: reqUser.id,
        },
      });
    }

    return {
      chatId: deletePrivateChatDto.chatId,
      userIdsToDelChat,
    };
  }
}
