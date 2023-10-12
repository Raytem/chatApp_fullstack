import { HttpException, HttpStatus } from '@nestjs/common';

export class NoSuchUserException extends HttpException {
  constructor() {
    super(['No such user'], HttpStatus.BAD_REQUEST);
    this.message = 'No such user';
  }
}
