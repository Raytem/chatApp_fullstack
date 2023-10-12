import { HttpException, HttpStatus } from '@nestjs/common';

export class NoSuchMessageException extends HttpException {
  constructor() {
    super(['No such message'], HttpStatus.BAD_REQUEST);
    this.message = 'No such message';
  }
}
