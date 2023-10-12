import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MyLoggerService extends ConsoleLogger {
  // constructor(private config: ConfigService) {
  //   super();
  // }

  customLog(message: string) {
    // this.log(this.config);
    this.log(message + '!!!!!!');
  }
}
