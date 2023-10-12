import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { SocketWitUser } from 'src/middlewares/wsJwtAuth.middleware';

export const WsUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const socket: SocketWitUser = ctx.switchToWs().getClient();
    return socket.user;
  },
);
