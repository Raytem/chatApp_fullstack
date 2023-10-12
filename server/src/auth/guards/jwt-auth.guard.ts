import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { apiConfig } from 'config/api.config';
import { IS_PUBLIC } from 'src/decorators/public-route.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,

    @Inject(apiConfig.KEY)
    private apiCfg: ConfigType<typeof apiConfig>,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getClass(),
      context.getHandler(),
    ]);
    if (isPublic || !this.apiCfg.isAuthEnabled) {
      return true;
    }

    return super.canActivate(context);
  }
}
