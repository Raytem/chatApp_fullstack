import { Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { jwtConfig } from 'config/jwt.config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { AccessTokenPayload } from '../interfaces/access_token-payload.interface';

export class JwtStrategy extends PassportStrategy(Strategy) {
  private accessSecret: string;

  constructor(
    @Inject(jwtConfig.KEY)
    private jwtCfg: ConfigType<typeof jwtConfig>,

    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtCfg.accessTokenSecret,
    });
  }

  async validate(payload: AccessTokenPayload) {
    const user = await this.authService.validate(payload?.userId);
    console.log('user:', { ...user, password: 'hidden' });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
