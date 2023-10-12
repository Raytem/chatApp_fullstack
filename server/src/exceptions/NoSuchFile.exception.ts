import { HttpException, HttpStatus } from '@nestjs/common';

export class NoSuchFileException extends HttpException {
  constructor() {
    super(['No such file'], HttpStatus.BAD_REQUEST);
    this.message = 'No such file';
  }
}
