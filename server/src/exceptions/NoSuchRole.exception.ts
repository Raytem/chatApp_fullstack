import { HttpException, HttpStatus } from '@nestjs/common';

export class NoSuchRoleException extends HttpException {
  constructor() {
    super(['No such role'], HttpStatus.INTERNAL_SERVER_ERROR);
    this.message = 'No such role';
  }
}
