import { ForbiddenError } from '@casl/ability';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FORBIDDEN_MESSAGE } from '@nestjs/core/guards';
import { Response } from 'express';

@Catch(ForbiddenError)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const res: Response = host.switchToHttp().getResponse();

    const errData = {
      status: HttpStatus.FORBIDDEN,
      error: FORBIDDEN_MESSAGE,
      message: exception.message,
    };

    console.log(errData);

    res.status(HttpStatus.FORBIDDEN).json(errData);
  }
}
