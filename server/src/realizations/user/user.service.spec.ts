import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ContextIdFactory } from '@nestjs/core';
import { ProductItemService } from '../product-item/product-item.service';
import { ConfigService } from 'src/modules/config/config.service';
import { ConfigModule } from 'src/modules/config/config.module';
import { ProductItemModule } from '../product-item/product-item.module';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [UserService, ProductItemService],
    }).compile();

    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);
    service = await moduleRef.resolve<UserService>(UserService, contextId);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
