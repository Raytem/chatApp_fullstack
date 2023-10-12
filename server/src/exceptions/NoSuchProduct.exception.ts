import { HttpException, HttpStatus } from '@nestjs/common';

export class NoSuchProductException extends HttpException {
  constructor() {
    super(['No such product'], HttpStatus.BAD_REQUEST);
    this.message = 'No such product';
  }
}
