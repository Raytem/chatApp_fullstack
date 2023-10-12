import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  createHttpOptions(): HttpModuleOptions | Promise<HttpModuleOptions> {
    return {
      timeout: 1000 * 10,
      maxRedirects: 5,
    };
  }
}
