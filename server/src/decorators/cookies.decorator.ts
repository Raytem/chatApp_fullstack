import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (key: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return key ? req.cookies?.[key] : req.cookies;
  },
);
