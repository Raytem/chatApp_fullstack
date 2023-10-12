import { CacheOptionsFactory, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { StoreConfig } from 'cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { redisConfig } from 'config/redis.config';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory<StoreConfig> {
  constructor(
    @Inject(redisConfig.KEY)
    private redisCfg: ConfigType<typeof redisConfig>,
  ) {}

  async createCacheOptions() {
    const store = await redisStore({
      socket: {
        host: this.redisCfg.host,
        port: this.redisCfg.port,
      },
      ttl: 1,
    });

    return {
      store: store,
    };
  }
}
