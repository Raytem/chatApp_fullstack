import { Test, TestingModule } from '@nestjs/testing';
import { OnlineStatusService } from './online-status.service';

describe('OnlineStatusService', () => {
  let service: OnlineStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnlineStatusService],
    }).compile();

    service = module.get<OnlineStatusService>(OnlineStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
