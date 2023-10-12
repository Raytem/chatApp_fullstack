import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MulterOptionsFactory } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { multerConfig } from 'config/multer.config';
import { diskStorage, memoryStorage } from 'multer';
import { FileService } from 'src/realizations/file/file.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  constructor(
    @Inject(multerConfig.KEY)
    private multerCfg: ConfigType<typeof multerConfig>,
  ) {}

  createMulterOptions(): MulterOptions | Promise<MulterOptions> {
    return {
      // storage: diskStorage({
      //   destination: this.multerCfg.destination,
      //   filename: async (req: any, file: Express.Multer.File, fn) => {
      //     const fileTypeRegexp = /.(png|jpg|jpeg|mp4)$/i;

      //     let err = null;
      //     if (!fileTypeRegexp.test(file.originalname)) {
      //       err = new BadRequestException('Invalid file type');
      //     }
      //     const resFileName = `${uuidv4()}.${file.originalname}`;

      //     fn(err, resFileName);
      //   },
      // }),
      // limits: {
      //   fileSize: 10e7,
      // },
    };
  }
}
