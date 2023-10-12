import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { AuthService } from 'src/auth/auth.service';
import {
  SocketWitUser,
  wsJwtAuthMiddleware,
} from 'src/middlewares/wsJwtAuth.middleware';
import { CreateMessageDto } from '../message/dto/create-message.dto';
import { UpdateMessageDto } from '../message/dto/update-message.dto';
import { MessageService } from '../message/message.service';
import { WsUser } from 'src/decorators/ws-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsExceptionFilter } from 'src/api/exception-filters/ws-exception.filter';
import { DeleteMessageDto } from '../message/dto/delete-message.dto';
import { PrivateChatService } from './private-chat.service';
import { MessageEntity } from '../message/entities/message.entity';
import { instanceToPlain } from 'class-transformer';
import { OnlineStatusService } from '../online-status/online-status.service';
import { GetPrivateChatDto } from './dto/get-private-chat.dto';
import { ReadPrivateChatMessagesDto } from './dto/read-private-chat-messages.dto';
import { DeletePrivateChatDto } from './dto/delete-private-chat.dto';
import { CLIENT_URL } from 'src/constraints';
import { TypingStatusDto } from './dto/typing-status-dto';

@UsePipes(ValidationPipe)
@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  namespace: 'private-chat',
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
})
export class PrivateChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private messageService: MessageService,

    private tokenService: TokenService,

    private authService: AuthService,

    private prChatService: PrivateChatService,

    private onlineStatusService: OnlineStatusService,
  ) {}

  async afterInit() {
    this.server.use(
      await wsJwtAuthMiddleware(this.authService, this.tokenService),
    );
  }

  async handleConnection(socket: SocketWitUser) {
    const user = socket.user;
    console.log('User %j is connected', user.id);
    const userPrivateChatIds = await this.prChatService.findPrivateChatIds(
      user.id,
      user,
    );
    if (userPrivateChatIds.length) {
      for (const id of userPrivateChatIds) {
        socket.join(id.toString());
      }
    }
    const onlineStatus = await this.onlineStatusService.update({
      isOnline: true,
      user,
    });

    socket.broadcast.emit('user:online-status', {
      userId: user.id,
      isOnline: onlineStatus.isOnline,
      lastActivity: onlineStatus.lastActivity,
    });
  }

  async handleDisconnect(socket: SocketWitUser) {
    const user = socket.user;
    console.log('User %j is disconnected', user.id);

    const onlineStatus = await this.onlineStatusService.update({
      isOnline: false,
      user,
    });

    socket.broadcast.emit('user:online-status', {
      userId: user.id,
      isOnline: onlineStatus.isOnline,
      lastActivity: onlineStatus.lastActivity,
    });
  }

  @SubscribeMessage('user:online-status-setOnline')
  async setOnline(
    @WsUser() wsUser: UserEntity,
    @ConnectedSocket() socket: SocketWitUser,
  ) {
    const onlineStatus = await this.onlineStatusService.update({
      isOnline: true,
      user: wsUser,
    });

    socket.broadcast.emit('user:online-status', {
      userId: wsUser.id,
      isOnline: onlineStatus.isOnline,
      lastActivity: onlineStatus.lastActivity,
    });
  }

  @SubscribeMessage('user:typing-status')
  async writeMsgStatus(
    @MessageBody() writeMessageDto: TypingStatusDto,
    @WsUser() wsUser: UserEntity,
    @ConnectedSocket() socket: SocketWitUser,
  ) {
    socket.broadcast
      .to(writeMessageDto.chatId.toString())
      .emit('user:typing-status', writeMessageDto);
  }

  @SubscribeMessage('private-chat:connect')
  async createChat(
    @MessageBody() getPrivateChatDto: GetPrivateChatDto,
    @WsUser() wsUser: UserEntity,
    @ConnectedSocket() socket: SocketWitUser,
  ) {
    socket.join(getPrivateChatDto.chatId.toString());

    const chatMembers = await this.prChatService.getChatMembers(
      getPrivateChatDto.chatId,
      wsUser,
    );

    const roomClients = await this.server
      .in(getPrivateChatDto.chatId.toString())
      .fetchSockets();

    if (chatMembers && chatMembers.length === 2 && roomClients.length < 2) {
      const secondUser = chatMembers.filter((m) => m.id !== wsUser.id)[0];
      socket.broadcast.emit('private-chat:connectInfo', {
        chatId: getPrivateChatDto.chatId,
        connectedUserId: secondUser.id,
      });
      console.log(`connected ${secondUser.id} to ${wsUser.id}`);
    }
  }

  @SubscribeMessage('private-chat:readMsgs')
  async readChatMessages(
    @MessageBody() readPrChatMsgsDto: ReadPrivateChatMessagesDto,
    @WsUser() wsUser: UserEntity,
    @ConnectedSocket() socket: SocketWitUser,
  ) {
    const readMsgsResponse = await this.prChatService.readChatMessages(
      readPrChatMsgsDto,
      wsUser,
    );
    this.server
      .to(readPrChatMsgsDto.chatId.toString())
      .emit('private-chat:readMsgs', readMsgsResponse);

    this.server
      .to(readPrChatMsgsDto.chatId.toString())
      .emit('private-chat:update', {
        id: readPrChatMsgsDto.chatId,
      });
  }

  @SubscribeMessage('private-chat:getOne')
  async getChat(
    @MessageBody() getPrivateChatDto: GetPrivateChatDto,
    @WsUser() wsUser: UserEntity,
    @ConnectedSocket() socket: SocketWitUser,
  ) {
    const chatsAndCnt = await this.prChatService.getUserChats(
      wsUser.id,
      wsUser,
      getPrivateChatDto.chatId,
    );
    const chats = chatsAndCnt.chats;

    const chat = chats.length ? chats[0] : null;

    socket.emit('private-chat:getOne', chat);
  }

  @SubscribeMessage('private-chat:delete')
  async deleteChat(
    @MessageBody() deletePrivateChatDto: DeletePrivateChatDto,
    @WsUser() wsUser: UserEntity,
    @ConnectedSocket() socket: SocketWitUser,
  ) {
    const deletedChat = await this.prChatService.delete(
      wsUser,
      deletePrivateChatDto,
    );

    //deleted chat.id and users for who chat is deleted
    this.server
      .to(deletePrivateChatDto.chatId.toString())
      .emit('private-chat:delete', {
        chatId: deletedChat.chatId,
        userIdsToDelChat: deletedChat.userIdsToDelChat,
      });
  }

  @SubscribeMessage('message:post')
  async create(
    @MessageBody() createMessageDto: CreateMessageDto,
    @WsUser() wsUser: UserEntity,
    @ConnectedSocket() socket: SocketWitUser,
  ) {
    console.log(createMessageDto);
    const messageAndChat = await this.messageService.create(
      createMessageDto,
      wsUser,
    );

    const serializedMessage = instanceToPlain(
      new MessageEntity(messageAndChat.message),
    );

    this.server.to(createMessageDto.chatId.toString()).emit('message:post', {
      chatId: createMessageDto.chatId,
      message: serializedMessage,
    });

    this.server
      .to(createMessageDto.chatId.toString())
      .emit('private-chat:update', messageAndChat.chat);
  }

  @SubscribeMessage('message:update')
  async update(
    @MessageBody() updateMessageDto: UpdateMessageDto,
    @WsUser() wsUser: UserEntity,
    @ConnectedSocket() socket: SocketWitUser,
  ) {
    const messageAndChat = await this.messageService.update(
      updateMessageDto,
      wsUser,
    );

    const serializedMessage = instanceToPlain(
      new MessageEntity(messageAndChat.message),
    );

    this.server.to(updateMessageDto.chatId.toString()).emit('message:update', {
      chatId: updateMessageDto.chatId,
      message: serializedMessage,
    });

    this.server
      .to(updateMessageDto.chatId.toString())
      .emit('private-chat:update', messageAndChat.chat);
  }

  @SubscribeMessage('message:remove')
  async remove(
    @MessageBody() deleteMessageDto: DeleteMessageDto,
    @WsUser() wsUser: UserEntity,
    @ConnectedSocket() socket: SocketWitUser,
  ) {
    const messageAndChat = await this.messageService.remove(
      deleteMessageDto,
      wsUser,
    );

    const serializedMessage = instanceToPlain(
      new MessageEntity(messageAndChat.message),
    );

    this.server.to(deleteMessageDto.chatId.toString()).emit('message:remove', {
      chatId: deleteMessageDto.chatId,
      message: serializedMessage,
    });

    this.server
      .to(deleteMessageDto.chatId.toString())
      .emit('private-chat:update', messageAndChat.chat);
  }
}
