import { Module } from '@nestjs/common';
import { AbilityFactory } from './ability-factory';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/realizations/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [AbilityFactory],
  exports: [AbilityFactory],
})
export class AbilityModule {}
