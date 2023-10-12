import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Inject, Injectable } from '@nestjs/common';
import { IConfigModuleOptions } from '../../interfaces/config-module-options.interface';
import { EnvConfig } from '../../interfaces/env-config.interface';
import { MODULE_OPTIONS_TOKEN } from './config.module-definition';

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: IConfigModuleOptions,
  ) {
    const filePath = `${process.env.NODE_ENV || 'development'}.env`;
    const envFile = path.resolve(
      __dirname,
      '../../../',
      options.folder,
      filePath,
    );
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  public get(key: string) {
    return this.envConfig[key];
  }
}
