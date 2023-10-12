import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { googleAuthConfig } from 'config/google-auth.config';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { CreateUserDto } from 'src/realizations/user/dto/create-user.dto';

export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleAuthConfig.KEY)
    private googleCfg: ConfigType<typeof googleAuthConfig>,
  ) {
    super({
      clientID: googleCfg.clientId,
      clientSecret: googleCfg.clientSecret,
      scope: ['profile', 'email'],
      callbackURL: googleCfg.redirectUrl,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const user: CreateUserDto = {
      name: profile._json.name,
      surname: profile.name.familyName || null,
      email: profile._json.email,
      birthday: null,
      password: null,
    };

    done(null, user);
  }
}
