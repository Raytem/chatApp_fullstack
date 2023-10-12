import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // const exceptionResponse = {
    //   ...(exception.getResponse() as Object),
    // };

    console.log({
      ...exception,
      path: request.url,
      timestamp: new Date().toISOString(),
      stack: exception.stack.split('\n'),
    });

    response.status(status).json({
      ...exception,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
