import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './realizations/user/user.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './api/exception-filters/http-exception.filter';
import { RolesGuard } from './auth/guards/roles.guard';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from '../config/app.config';
import { databaseConfig } from 'config/database.config';
import { validateConfig } from '../config/validation/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { apiConfig } from '../config/api.config';
import { ApiConfigService } from './api/apiConfig.service';
import { RoleModule } from './realizations/role/role.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationService } from './schedule/notification.service';
import { redisConfig } from 'config/redis.config';
import { BullModule } from '@nestjs/bull';
import { TypeOrmConfigService } from 'config/cfgClasses/typeorm-config.service';
import { CacheConfigService } from 'config/cfgClasses/cache-config.service';
import { BullConfigService } from 'config/cfgClasses/bull-config.service';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { FileModule } from './realizations/file/file.module';
import { MyLoggerModule } from './my-logger/my-logger.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpModule } from '@nestjs/axios';
import { HttpConfigService } from 'config/cfgClasses/http-config.service';
import { AuthModule } from './auth/auth.module';
import { jwtConfig } from 'config/jwt.config';
import { multerConfig } from 'config/multer.config';
import { ProductModule } from './realizations/product/product.module';
import { RedisConfigService } from 'config/cfgClasses/redis-config.service';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { googleAuthConfig } from 'config/google-auth.config';
import { AbilityModule } from './ability/ability.module';
import { ForbiddenExceptionFilter } from './api/exception-filters/forbidden-exception.filter';
import { PoliciesGuard } from './auth/guards/policies.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrivateChatModule } from './realizations/private-chat/private-chat.module';
import { MessageModule } from './realizations/message/message.module';
import { PaginationModule } from './pagination/pagination.module';
import { MulterModule } from '@nestjs/platform-express';
import { OnlineStatusModule } from './realizations/online-status/online-status.module';
import { GoogleDriveModule } from './google-drive/google-drive.module';
import { googleDriveConfig } from 'config/google-drive.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        apiConfig,
        jwtConfig,
        googleAuthConfig,
        multerConfig,
        googleDriveConfig,
      ],
      validate: validateConfig,
    }),
    RedisModule.forRootAsync({
      useClass: RedisConfigService,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
    CacheModule.registerAsync({
      useClass: CacheConfigService,
      isGlobal: true,
    }),
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    MulterModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    RoleModule,
    ProductModule,
    FileModule,
    MyLoggerModule,
    AbilityModule,
    PrivateChatModule,
    MessageModule,
    PaginationModule,
    OnlineStatusModule,
    GoogleDriveModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ApiConfigService,
    NotificationService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PoliciesGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    // { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: ForbiddenExceptionFilter },
    // { provide: APP_INTERCEPTOR, useClass: HttpCacheInterceptor },
  ],
})
export class AppModule {}