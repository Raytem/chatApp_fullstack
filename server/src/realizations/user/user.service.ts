import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ILike, In, Like, Repository } from 'typeorm';
import { RoleEntity } from '../role/entities/role.entity';
import { NotificationService } from 'src/schedule/notification.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserPrintedEvent } from './events/user-printed.event';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { HttpService } from '@nestjs/axios';
import { delay, firstValueFrom, lastValueFrom, map } from 'rxjs';
import { ProductEntity } from '../product/entities/product.entity';
import { NoSuchUserException } from 'src/exceptions/NoSuchUser.exception';
import { DeleteFilesEvent } from '../file/events/delete-files.event';
import { AbilityFactory, Action } from 'src/ability/ability-factory';
import { ForbiddenError } from '@casl/ability';
import { PaginationService } from 'src/pagination/pagination.service';
import { UserFilterDto } from './dto/user-filter.dto';
import { PrivateChatService } from '../private-chat/private-chat.service';
import { ModuleRef } from '@nestjs/core';
import { PrivateChatEntity } from '../private-chat/entities/private-chat.entity';
import { FileEntity, toUrl } from '../file/entities/file.entity';
import { FileService } from 'src/realizations/file/file.service';
import { OnlineStatusEntity } from '../online-status/entities/online-status.entity';
import { MessageService } from '../message/message.service';
import { MessageEntity } from '../message/entities/message.entity';
import { User_PrivateChatEntity } from '../user_private-chat/entities/user_private-chat.entity';
import { instanceToPlain } from 'class-transformer';
import { PrivateChatDto } from '../private-chat/dto/privateChat.dto';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import { UserChatsAndCnt } from 'src/interfaces/user-chats-and-cnt.interface';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';

@Injectable({
  // scope: Scope.REQUEST,
  // durable: true,
})
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,

    @InjectRepository(PrivateChatEntity)
    private prChatRepository: Repository<PrivateChatEntity>,

    @InjectRepository(OnlineStatusEntity)
    private onlineStatusRepository: Repository<OnlineStatusEntity>,

    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,

    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,

    private fileService: FileService,

    private abilityFactory: AbilityFactory,

    private httpService: HttpService,

    private googleDriveService: GoogleDriveService,

    private eventEmitter: EventEmitter2,

    private paginationService: PaginationService,

    @Inject(forwardRef(() => PrivateChatService))
    private privateChatService: PrivateChatService,

    notificationService: NotificationService,
  ) {}

  async findAll(userFilterDto?: UserFilterDto) {
    const pagination = this.paginationService.getPagination(userFilterDto);

    let nameFilter = '';
    let surnameFilter = '';
    if (userFilterDto.fullName) {
      nameFilter = userFilterDto.fullName.split(' ')[0] || '';
      surnameFilter = userFilterDto.fullName.split(' ')[1] || '';
    }

    return await this.userRepository.find({
      where: [
        {
          name: ILike(`%${nameFilter}%`),
          surname: ILike(`%${surnameFilter}%`),
        },
        {
          name: ILike(`%${surnameFilter}%`),
          surname: ILike(`%${nameFilter}%`),
        },
      ],
      ...pagination,
    });
  }

  async findByIds(userIds: number[]) {
    return await this.userRepository.find({
      where: {
        id: In(userIds),
      },
    });
  }

  async findOne(id: number, email?: string): Promise<UserEntity> {
    let user;
    if (!email) {
      user = await this.userRepository.findOneBy({ id });
    } else {
      user = await this.userRepository.findOneBy({ email });
    }

    if (!user) {
      throw new NoSuchUserException();
    }

    return user;
  }

  async findProducts(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NoSuchUserException();
    }
    return await this.productRepository.findBy({ user: user });
  }

  async findPrivateChats(
    id: number,
    reqUser: UserEntity,
    paginationDto?: PaginationDto,
  ): Promise<UserChatsAndCnt> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NoSuchUserException();
    }
    if (id !== reqUser.id) {
      throw new ForbiddenException('You can get only your chats');
    }

    const chatsAndCnt = await this.privateChatService.getUserChats(
      id,
      reqUser,
      0,
      paginationDto,
    );
    return {
      chats: chatsAndCnt.chats,
      cnt: chatsAndCnt.cnt,
    };
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    reqUser: UserEntity,
    avatar?: Express.Multer.File,
  ) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NoSuchUserException();
    }

    const ability = await this.abilityFactory.defineAbilityFor(reqUser);
    ForbiddenError.from(ability).throwUnlessCan(Action.Update, user);

    if (avatar) {
      await this.fileService.uploadAvatar(user, avatar);
    }

    await this.userRepository.update(id, {
      ...updateUserDto,
      email: user.email,
    });

    return await this.userRepository.findOneBy({ id });
  }

  async remove(id: number, reqUser: UserEntity) {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: {
        onlineStatus: true,
        avatar: true,
      },
    });

    if (!user) {
      throw new NoSuchUserException();
    }

    const ability = await this.abilityFactory.defineAbilityFor(reqUser);
    ForbiddenError.from(ability).throwUnlessCan(Action.Delete, user);

    const products = await this.findProducts(user.id);
    if (products.length) {
      const files = products.map((prod) => prod.photos).flat();
      if (files.length) {
        const fileNames = files.map((file) => file.name);
        await this.eventEmitter.emit(
          DeleteFilesEvent.eventName,
          new DeleteFilesEvent(fileNames),
        );
      }
    }

    const userAvatar = user.avatar;
    const userOnlineStatus = user.onlineStatus;

    const userChatsAndCnt = await this.findPrivateChats(id, reqUser);
    const userChats = userChatsAndCnt.chats;

    const mockUser = {
      id: null,
    } as UserEntity;

    await this.userRepository.remove(user);

    if (userAvatar) {
      const folder = await this.googleDriveService.findFolder(`usr_${id}`);
      await this.googleDriveService.removeFolder(folder.id);

      await this.fileRepository.delete(userAvatar.id);
    }

    if (userOnlineStatus) {
      await this.onlineStatusRepository.delete(userOnlineStatus.id);
    }

    if (userChats.length) {
      for (const chat of userChats) {
        if (chat.membersCnt === 1) {
          await this.prChatRepository.delete(chat.id);
        }
      }
    }

    return user;
  }

  @OnEvent(UserPrintedEvent.eventName)
  handleUserPrintedEvent(payload: UserPrintedEvent) {
    this.logger.log(`User printed, userId: ${payload.userId}`);
  }
}
