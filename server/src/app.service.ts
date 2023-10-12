import { Injectable } from '@nestjs/common';
import { UserService } from './realizations/user/user.service';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to the nest-test_1 project!';
  }
}
