import {
  BullRootModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { redisConfig } from 'config/redis.config';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(
    @Inject(redisConfig.KEY)
    private redisCfg: ConfigType<typeof redisConfig>,
  ) {}

  createSharedConfiguration():
    | BullRootModuleOptions
    | Promise<BullRootModuleOptions> {
    return {
      redis: {
        host: this.redisCfg.host,
        port: this.redisCfg.port,
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    };
  }
}
