import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { FileConsumer } from './queue/file.consumer';
import { FileProducer } from './queue/file.producer';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from 'config/cfgClasses/multer-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { ProductEntity } from '../product/entities/product.entity';
import { AbilityModule } from 'src/ability/ability.module';
import { GoogleDriveModule } from 'src/google-drive/google-drive.module';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { UserEntity } from '../user/entities/user.entity';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'file-operation' }),
    TypeOrmModule.forFeature([FileEntity, ProductEntity, UserEntity]),
    AbilityModule,
    GoogleDriveModule,
  ],
  controllers: [FileController],
  providers: [FileService, FileConsumer, FileProducer, GoogleDriveService],
  exports: [FileService],
})
export class FileModule {}
