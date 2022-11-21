import { Test, TestingModule } from '@nestjs/testing';

import { BossRaidController } from '../bossRaid.controller';
import { BossRaidService } from '../bossRaid.service';

describe('BossRaidController', () => {
  let controller: BossRaidController;
  let service: BossRaidService;
  const mockBossraidService = () => ({
    enterBossRaid: jest.fn(() => {
      return { isEntered: true, raidRecordId: 1 };
    }),
    endBossRaid: jest.fn(() => {
      return {};
    }),
    getBossRaidStatus: jest.fn(() => {
      return { canEnter: true };
    }),
    getBossRaidRank: jest.fn(() => {
      return { topRankerInfoList: [], getMyRankingInfo: {} };
    }),
  });
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BossRaidController],
      providers: [
        {
          provide: BossRaidService,
          useFactory: mockBossraidService,
        },
      ],
    }).compile();
    controller = module.get<BossRaidController>(BossRaidController);
    service = module.get<BossRaidService>(BossRaidService);
  });

  it('should be defined controller', () => {
    expect(controller).toBeDefined();
  });
  it('shoud be defiend service', () => {
    expect(service).toBeDefined();
  });

  describe('enter Bossraid', () => {
    it('return response value', async () => {
      const enterBossRaidRequestDto = {
        userId: 28,
        level: 1,
      };
      const response = await controller.enterBossRaid(enterBossRaidRequestDto);
      expect(response).toEqual({ isEntered: true, raidRecordId: 1 });
      expect(service.enterBossRaid).toBeCalledTimes(1);
      expect(service.enterBossRaid).toBeCalledWith(enterBossRaidRequestDto);
    });
  });

  describe('end Bossraid', () => {
    it('return response undefined', async () => {
      const endBossRaidRequestDto = {
        userId: 28,
        raidRecordId: 141,
      };
      const response = await controller.endBossRaid(endBossRaidRequestDto);
      expect(response).toBe(undefined);
      expect(service.endBossRaid).toBeCalledTimes(1);
      expect(service.endBossRaid).toBeCalledWith(endBossRaidRequestDto);
    });
  });

  describe('get Bossraid Status', () => {
    it('return response value', async () => {
      const response = await controller.getBossRaidStatus();
      expect(response).toEqual({ canEnter: true });
      expect(service.getBossRaidStatus).toBeCalledTimes(1);
      expect(service.getBossRaidStatus).toBeCalledWith();
    });
  });

  describe('get Bossraid Rank', () => {
    it('return response value', async () => {
      const userId = 1;
      const response = await controller.getBossRaidRank(userId);
      expect(response).toEqual({ topRankerInfoList: [], getMyRankingInfo: {} });
      expect(service.getBossRaidRank).toBeCalledTimes(1);
      expect(service.getBossRaidRank).toBeCalledWith(userId);
    });
  });
});
