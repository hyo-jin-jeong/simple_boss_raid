import { BossRaidRepository } from './bossRaid.repository';
import {
  Injectable,
  CACHE_MANAGER,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { UserRepository } from 'src/users/users.repository';
import { BossRaid } from './bossRaid.entity';
import { User } from 'src/users/user.entity';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { StartBossRaidDto } from './dto/startBossRaid';
import { EndBossRaidDto } from './dto/startBossRaid copy';

@Injectable()
export class BossRaidService {
  constructor(
    private bossRaidRepository: BossRaidRepository,
    private userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRedis() private readonly redis: Redis,
    private readonly httpService: HttpService,
  ) {
    this.getBossRaidInfo();
  }
  async getBossRaidInfo() {
    await firstValueFrom(
      this.httpService.get(
        'https://dmpilf5svl7rv.cloudfront.net/assignment/backend/bossRaidData.json',
      ),
    )
      .then(async (result) => {
        const bossRaids = result.data['bossRaids'][0];
        await this.cacheManager.set('bossRaidInfo', bossRaids, 0);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async startBossRaid(
    startBossRaidDto: StartBossRaidDto,
  ): Promise<BossRaid> | null {
    const { userId, level } = startBossRaidDto;
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new BadRequestException('INVALID_USER');
    }
    let bossRaidInfo = await this.cacheManager.get('bossRaidInfo');
    if (!bossRaidInfo) {
      await this.getBossRaidInfo();
      bossRaidInfo = await this.cacheManager.get('bossRaidInfo');
    }
    const levelInfo = Array.from(await bossRaidInfo['levels']).filter(
      (value) => value['level'] === level,
    );
    if (!levelInfo) {
      throw new BadRequestException('INVALID_LEVEL');
    }
    const bossRaidLimitSeconds = bossRaidInfo['bossRaidLimitSeconds'];
    return await this.bossRaidRepository.createBossRaid(
      user,
      level,
      bossRaidLimitSeconds,
    );
  }

  async endBossRaid(endBossRaidDto: EndBossRaidDto): Promise<void> {
    const { userId, raidRecordId } = endBossRaidDto;
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new BadRequestException('INVALID_USER');
    }
    const bossRaid = await this.bossRaidRepository.getBossRaidById(
      raidRecordId,
    );
    if (!bossRaid) {
      throw new BadRequestException('INVALID_BOSSRAID');
    }
    if (bossRaid.endTime) {
      throw new BadRequestException('ALREADY END');
    }
    let bossRaidInfo = await this.cacheManager.get('bossRaidInfo');
    if (!bossRaidInfo) {
      await this.getBossRaidInfo();
      bossRaidInfo = await this.cacheManager.get('bossRaidInfo');
    }
    const levelInfo = Array.from(await bossRaidInfo['levels']).filter(
      (value) => value['level'] === bossRaid.level,
    );
    const score = levelInfo[0]['score'];
    if (!score) {
      throw new BadRequestException('INVALID_SCORE');
    }
    const bossRaidLimitSeconds = bossRaidInfo['bossRaidLimitSeconds'];
    const isRunning = this.bossRaidRepository.isRunningBossRaid(
      bossRaid,
      bossRaidLimitSeconds,
    );

    if (!isRunning) {
      throw new BadRequestException('TIME_OUT');
    }
    const updatedUser = await this.bossRaidRepository.updateBossRaid(
      user,
      bossRaid,
      score,
    );
    if (!updatedUser) {
      throw new BadRequestException('FAILD_UPDATE');
    }
    await this.redis.zadd('rank', updatedUser.totalScore, updatedUser.id);
  }

  async getBossRaidStatus(): Promise<User> | null {
    let bossRaidInfo = await this.cacheManager.get('bossRaidInfo');
    if (!bossRaidInfo) {
      await this.getBossRaidInfo();
      bossRaidInfo = await this.cacheManager.get('bossRaidInfo');
    }
    const bossRaidLimitSeconds = bossRaidInfo['bossRaidLimitSeconds'];
    const notEndBossRaid = await this.bossRaidRepository.getNotEndBoss();
    return this.bossRaidRepository.isRunningBossRaid(
      notEndBossRaid,
      bossRaidLimitSeconds,
    );
  }
  async changeToRankingInfoType(userId: number): Promise<RankingInfo> {
    const score = Number(await this.redis.zscore('rank', userId));
    return {
      ranking: await this.redis.zrevrank('rank', userId),
      userId,
      totalScore: score,
    };
  }

  async getTopRankerInfoList(): Promise<RankingInfo[]> {
    const topRankerInfoList = await Promise.all(
      (
        await this.redis.zrevrange('rank', 0, 10)
      ).map(
        async (userId) => await this.changeToRankingInfoType(Number(userId)),
      ),
    );
    return topRankerInfoList;
  }

  async getMyRankingInfo(userId: number): Promise<RankingInfo> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new BadRequestException('INVALID_USER');
    }
    return await this.changeToRankingInfoType(userId);
  }
}
