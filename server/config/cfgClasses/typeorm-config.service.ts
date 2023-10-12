import { Inject, Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { databaseConfig } from 'config/database.config';
import { NodeEnv } from 'config/validation/env.validation';
import { FileEntity } from 'src/realizations/file/entities/file.entity';
import { MessageEntity } from 'src/realizations/message/entities/message.entity';
import { OnlineStatusEntity } from 'src/realizations/online-status/entities/online-status.entity';
import { PrivateChatEntity } from 'src/realizations/private-chat/entities/private-chat.entity';
import { ProductEntity } from 'src/realizations/product/entities/product.entity';
import { RoleEntity } from 'src/realizations/role/entities/role.entity';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { User_PrivateChatEntity } from 'src/realizations/user_private-chat/entities/user_private-chat.entity';
import { FileEntitySubscriber } from 'src/typeorm-subscribers/file.subscriber';
import { UserEntitySubscriber } from 'src/typeorm-subscribers/user.subscriber';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(databaseConfig.KEY)
    private dbConfig: ConfigType<typeof databaseConfig>,

    private configService: ConfigService,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: 'postgres',
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      database: this.dbConfig.database,
      username: this.dbConfig.username,
      password: this.dbConfig.password,
      subscribers: [FileEntitySubscriber, UserEntitySubscriber],
      synchronize:
        this.configService.get('nodeEnv') === NodeEnv.Production ? false : true,
      entities: [
        RoleEntity,
        UserEntity,
        User_PrivateChatEntity,
        PrivateChatEntity,
        ProductEntity,
        FileEntity,
        MessageEntity,
        OnlineStatusEntity,
      ],
      retryAttempts: 1,
    };
  }
}
