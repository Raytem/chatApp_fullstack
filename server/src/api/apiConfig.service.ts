import { Global, Inject, Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { apiConfig } from 'config/api.config';

@Global()
@Injectable()
export class ApiConfigService {
  constructor(
    @Inject(apiConfig.KEY) private apiCfg: ConfigType<typeof apiConfig>,
  ) {}

  get isAuthEnabled(): boolean {
    return this.apiCfg.isAuthEnabled;
  }
}
