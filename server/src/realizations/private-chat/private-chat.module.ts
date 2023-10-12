import { Module, forwardRef } from '@nestjs/common';
import { PrivateChatService } from './private-chat.service';
import { PrivateChatGateway } from './private-chat.gateway';
import { PrivateChatEntity } from './entities/private-chat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivateChatController } from './private-chat.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from '../user/user.module';
import { MessageEntity } from '../message/entities/message.entity';
import { MessageService } from '../message/message.service';
import { OnlineStatusModule } from '../online-status/online-status.module';
import { User_PrivateChatEntity } from '../user_private-chat/entities/user_private-chat.entity';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PrivateChatEntity,
      MessageEntity,
      MessageEntity,
      User_PrivateChatEntity,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => MessageModule),
    OnlineStatusModule,
  ],
  controllers: [PrivateChatController],
  providers: [PrivateChatService, MessageService, PrivateChatGateway],
  exports: [PrivateChatService],
})
export class PrivateChatModule {}
