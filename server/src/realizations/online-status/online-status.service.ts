import { BadGatewayException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OnlineStatusEntity } from './entities/online-status.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOnlineStatusDto } from './dto/create-online-status.dto';

@Injectable()
export class OnlineStatusService {
  constructor(
    @InjectRepository(OnlineStatusEntity)
    private onlineStatusRepository: Repository<OnlineStatusEntity>,
  ) {}

  async findOne(id: number) {
    const onlineStatus = await this.onlineStatusRepository.findOneBy({ id });

    if (!onlineStatus) {
      throw new BadGatewayException('No such online status');
    }

    return onlineStatus;
  }

  async update(createOnlineStatusDto: CreateOnlineStatusDto) {
    const curStatus = await this.onlineStatusRepository.findOne({
      where: {
        user: {
          id: createOnlineStatusDto.user.id,
        },
      },
      relations: {
        user: true,
      },
    });
    if (curStatus) {
      await this.onlineStatusRepository.update(
        { id: curStatus.id },
        {
          isOnline: createOnlineStatusDto.isOnline,
        },
      );
      return await this.onlineStatusRepository.findOneBy({ id: curStatus.id });
    } else {
      const newOnlineStatus = await this.onlineStatusRepository.save({
        user: createOnlineStatusDto.user,
        isOnline: createOnlineStatusDto.isOnline,
      });
      return newOnlineStatus;
    }
  }
}
