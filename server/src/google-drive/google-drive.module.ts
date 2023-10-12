import { Module } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';

@Module({
  providers: [GoogleDriveService],
  exports: [GoogleDriveModule],
})
export class GoogleDriveModule {}
