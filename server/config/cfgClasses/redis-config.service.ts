import {
  RedisModuleOptions,
  RedisOptionsFactory,
} from '@liaoliaots/nestjs-redis';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { redisConfig } from '../redis.config';

@Injectable()
export class RedisConfigService implements RedisOptionsFactory {
  constructor(
    @Inject(redisConfig.KEY)
    private redisCfg: ConfigType<typeof redisConfig>,
  ) {}

  createRedisOptions(): RedisModuleOptions {
    return {
      config: {
        host: this.redisCfg.host,
        port: this.redisCfg.port,
      },
    };
  }
}
