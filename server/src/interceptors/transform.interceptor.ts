import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map, timeout } from 'rxjs';

export interface Resp<T> {
  data: T;
}

const wait = (ms: number) => new Promise((res, rej) => setTimeout(res, ms));

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Resp<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Resp<T>> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}
