import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Inject,
  Res,
  Session,
  Sse,
  ForbiddenException,
  Query,
  UploadedFile,
  ParseFilePipeBuilder,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../enums/role.enum';
import { User } from '../../decorators/req-user.decorator';
import { ConfigService, ConfigType } from '@nestjs/config';
import { databaseConfig } from 'config/database.config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cookies } from 'src/decorators/cookies.decorator';
import { Response } from 'express';
import { Observable, interval, switchMap } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import { UserEntity } from './entities/user.entity';
import { Public } from 'src/decorators/public-route.decorator';
import { CheckPolicies } from 'src/decorators/check-policies.decorator';
import { Action, AppAbility } from 'src/ability/ability-factory';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ProductEntity } from '../product/entities/product.entity';
import { PrivateChatEntity } from '../private-chat/entities/private-chat.entity';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('user')
@Controller({ path: 'user' })
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cfg: ConfigService,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    @Inject(databaseConfig.KEY)
    private readonly dbConfig: ConfigType<typeof databaseConfig>,
  ) {}

  //---Test_Routes---
  // @Get('page')
  // showUsersPage(@Res() res: Response) {
  //   res
  //     .type('text/html')
  //     .send(
  //       fs
  //         .readFileSync(path.join(process.cwd(), 'views', 'users.html'))
  //         .toString(),
  //     );
  // }

  // async getUsersMgEvent() {
  //   return { data: await this.userService.findAll() } as MessageEvent;
  // }

  // @ApiCreatedResponse({ type: Observable })
  // @Sse('sse')
  // sse(): Observable<MessageEvent<any>> {
  //   return interval(3000).pipe(switchMap(() => this.getUsersMgEvent()));
  // }

  // @Get('getSession')
  // async getSession(@Session() session: Record<string, any>) {
  //   session.authenticated = true;
  //   console.log(session);
  //   console.log(session.id);
  //   return session;
  // }

  // @Get('setCookies')
  // async setCookies(@Res({ passthrough: true }) res: Response) {
  //   res.cookie('name', 'some', { httpOnly: true, maxAge: 40000 });
  //   return 0;
  // }
  //------==-------

  @ApiCreatedResponse({ type: UserEntity, isArray: true })
  @Public()
  @Get(':userId/products')
  async findProducts(@Param('userId', ParseIntPipe) userId: number) {
    return await this.userService.findProducts(userId);
  }

  @ApiCreatedResponse({ type: PrivateChatEntity, isArray: true })
  @Get(':userId/chats')
  async findPrivateChats(
    @Param('userId', ParseIntPipe) userId: number,
    @User() reqUser: UserEntity,
    @Query() paginationDto: PaginationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const chatsAndCnt = await this.userService.findPrivateChats(
      userId,
      reqUser,
      paginationDto,
    );

    res.set('x-total-count', chatsAndCnt.cnt.toString());
    return chatsAndCnt.chats;
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity, isArray: true })
  @Get()
  async findAll(@Query() userFilter?: UserFilterDto) {
    return await this.userService.findAll(userFilter);
  }

  @ApiCreatedResponse({ type: UserEntity })
  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  @UseInterceptors(FileInterceptor('avatar'))
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @User() reqUser: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile()
    avatar?: Express.Multer.File,
  ) {
    if (avatar) {
      if (!/image\/.*/.test(avatar?.mimetype)) {
        throw new BadRequestException('Invalid file type');
      }

      if (avatar.size > 5e6) {
        throw new BadRequestException('Max file size is 5mb');
      }
    }

    return await this.userService.update(id, updateUserDto, reqUser, avatar);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User() reqUser: UserEntity,
  ) {
    return await this.userService.remove(id, reqUser);
  }
}
