import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from '../role/entities/role.entity';
import { NotificationService } from 'src/schedule/notification.service';
import { HttpModule } from '@nestjs/axios';
import { ProductEntity } from '../product/entities/product.entity';
import { AbilityFactory } from 'src/ability/ability-factory';
import { PrivateChatModule } from '../private-chat/private-chat.module';
import { PrivateChatEntity } from '../private-chat/entities/private-chat.entity';
import { FileEntity } from '../file/entities/file.entity';
import { FileModule } from '../file/file.module';
import { OnlineStatusEntity } from '../online-status/entities/online-status.entity';
import { MessageModule } from '../message/message.module';
import { GoogleDriveModule } from 'src/google-drive/google-drive.module';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { MessageEntity } from '../message/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      ProductEntity,
      PrivateChatEntity,
      FileEntity,
      OnlineStatusEntity,
      MessageEntity,
    ]),
    HttpModule,
    FileModule,
    GoogleDriveModule,
    forwardRef(() => MessageModule),
    forwardRef(() => PrivateChatModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    NotificationService,
    UserService,
    AbilityFactory,
    GoogleDriveService,
  ],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
