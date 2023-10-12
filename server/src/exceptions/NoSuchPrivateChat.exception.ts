import { HttpException, HttpStatus } from '@nestjs/common';

export class NoSuchPrivateChatException extends HttpException {
  constructor() {
    super(['No such private chat'], HttpStatus.BAD_REQUEST);
    this.message = 'No such private chat';
  }
}
