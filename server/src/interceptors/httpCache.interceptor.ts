import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest<Request>();
    return `${request.url} ${request.headers.authorization}`;
  }
}
