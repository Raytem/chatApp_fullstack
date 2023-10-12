import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { getDevice } from 'src/utils/get-device.util';

export const Device = createParamDecorator(
  (key: string, context: ExecutionContext) => {
    const req: Request = context.switchToHttp().getRequest();
    const userAgent = req.headers['user-agent'];
    return getDevice(userAgent);
  },
);
