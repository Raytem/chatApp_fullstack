import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { SocketWitUser } from 'src/middlewares/wsJwtAuth.middleware';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const client: SocketWitUser = host.switchToWs().getClient();
    console.log(exception);
    client.emit('error', exception);
  }
}
