import { Module } from '@nestjs/common';
import { OnlineStatusService } from './online-status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnlineStatusEntity } from './entities/online-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OnlineStatusEntity])],
  providers: [OnlineStatusService],
  exports: [OnlineStatusService],
})
export class OnlineStatusModule {}
