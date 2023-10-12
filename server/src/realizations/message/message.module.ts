import { Module, forwardRef } from '@nestjs/common';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import { PrivateChatService } from '../private-chat/private-chat.service';
import { PrivateChatEntity } from '../private-chat/entities/private-chat.entity';
import { PrivateChatModule } from '../private-chat/private-chat.module';
import { UserModule } from '../user/user.module';
import { MessageController } from './message.controller';
import { User_PrivateChatEntity } from '../user_private-chat/entities/user_private-chat.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity, User_PrivateChatEntity]),
    forwardRef(() => PrivateChatModule),
    forwardRef(() => UserModule),
  ],
  providers: [MessageService],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
