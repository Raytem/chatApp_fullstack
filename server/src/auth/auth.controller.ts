import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Redirect,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from 'src/realizations/user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { SingInDto } from './dto/login.dto';
import { Cookies } from 'src/decorators/cookies.decorator';
import { Response } from 'express';
import { jwtConfig } from 'config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { Public } from 'src/decorators/public-route.decorator';
import { setRefreshTokenCookie } from '../utils/set-refresh-token-cookie';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { User } from 'src/decorators/req-user.decorator';
import { Device } from 'src/decorators/device.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { TokenService } from './token.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { UserData } from './interfaces/user-data.interface';
import { Tokens } from './interfaces/tokens.interface';
import { CheckPolicies } from 'src/decorators/check-policies.decorator';
import { Action, AppAbility } from 'src/ability/ability-factory';
import { SignUpResponse } from './interfaces/signup-response.interface';
import { UserService } from 'src/realizations/user/user.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,

    private tokenService: TokenService,

    @Inject(jwtConfig.KEY)
    private jwtCfg: ConfigType<typeof jwtConfig>,
  ) {}

  @ApiCreatedResponse({ type: SignUpResponse })
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  async googleRedirect(
    @User() user: CreateUserDto,
    @Device() device: string,
    @Res({ passthrough: true }) res: Response,
    @Cookies('refreshToken') refreshToken: string,
  ) {
    const userData = await await this.authService.googleLogin(
      user,
      device,
      refreshToken,
    );

    setRefreshTokenCookie(
      res,
      userData.tokens.refreshToken,
      this.jwtCfg.refreshCookieLifetime,
    );

    return {
      user: { ...userData.user },
      accessToken: userData.tokens.accessToken,
    };
  }

  @ApiCreatedResponse({ type: SignUpResponse })
  @Public()
  @UseInterceptors(FileInterceptor('avatar'))
  @Post('signup')
  @ApiBody({
    type: CreateUserDto,
  })
  async signup(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
    @Device() device: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignUpResponse> {
    if (avatar) {
      if (!/image\/.*/.test(avatar?.mimetype)) {
        throw new BadRequestException('Invalid file type');
      }

      if (avatar.size > 5e6) {
        throw new BadRequestException('Max file size is 5mb');
      }
    }

    const userData = await this.authService.signup(
      createUserDto,
      device,
      avatar,
    );
    setRefreshTokenCookie(
      res,
      userData.tokens.refreshToken,
      this.jwtCfg.refreshCookieLifetime,
    );

    return {
      user: userData.user,
      accessToken: userData.tokens.accessToken,
    };
  }

  @ApiCreatedResponse({ type: SignUpResponse })
  @Public()
  // @UseGuards(ThrottlerGuard)
  // @Throttle(6, 180)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() singInDto: SingInDto,
    @Device() device: string,
    @Res({ passthrough: true }) res: Response,
    @Cookies('refreshToken') refreshToken: string,
  ): Promise<SignUpResponse> {
    const userData = await this.authService.login(
      singInDto,
      device,
      refreshToken,
    );
    setRefreshTokenCookie(
      res,
      userData.tokens.refreshToken,
      this.jwtCfg.refreshCookieLifetime,
    );

    const response: SignUpResponse = {
      user: userData.user,
      accessToken: userData.tokens.accessToken,
    };
    return {
      user: userData.user,
      accessToken: userData.tokens.accessToken,
    };
  }

  @ApiCreatedResponse({ type: OmitType(Tokens, ['accessToken']) })
  @Public()
  @Get('logout')
  async logout(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
    });
    const token = await this.authService.logout(refreshToken);
    return {
      refreshToken: token,
    };
  }

  @ApiCreatedResponse({ type: SignUpResponse })
  @Public()
  @Get('refresh')
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignUpResponse> {
    const userData = await this.authService.refresh(refreshToken);
    setRefreshTokenCookie(
      res,
      userData.tokens.refreshToken,
      this.jwtCfg.refreshCookieLifetime,
    );

    return {
      user: userData.user,
      accessToken: userData.tokens.accessToken,
    };
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: String, isArray: true })
  @Get(':userId/sessionDevices')
  async getSessionDevices(
    @User() reqUser: UserEntity,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.authService.getSessionDevices(reqUser, userId);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: String, isArray: true })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, UserEntity),
  )
  @Get('logoutFromAllDevices')
  async logoutFromAllDevices(@Cookies('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    return await this.tokenService.logoutFromSessionsExcept(refreshToken);
  }
}
