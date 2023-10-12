import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/realizations/user/user.module';
import { ApiConfigService } from 'src/api/apiConfig.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { AbilityModule } from 'src/ability/ability.module';
import { PrivateChatModule } from 'src/realizations/private-chat/private-chat.module';
import { FileModule } from 'src/realizations/file/file.module';
import { OnlineStatusModule } from 'src/realizations/online-status/online-status.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => PrivateChatModule),
    PassportModule,
    JwtModule.register({}),
    AbilityModule,
    FileModule,
    OnlineStatusModule,
  ],
  providers: [
    AuthService,
    TokenService,
    ApiConfigService,
    JwtStrategy,
    GoogleStrategy,
  ],
  controllers: [AuthController],
  exports: [TokenService, AuthService],
})
export class AuthModule {}
