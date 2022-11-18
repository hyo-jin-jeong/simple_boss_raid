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
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import {
  EnterBossRaidRequestDto,
  EnterBossRaidReponseDto,
} from './dto/enterBossRaid';
import { EndBossRaidRequestDto } from './dto/endBossRaid';
import { GetBossRaidStatusResponseDto } from './dto/getBossRaidStatus';
import { ConfigService } from '@nestjs/config';
import { DataSource, IsNull } from 'typeorm';
import { User } from 'src/users/user.entity';

@Injectable()
export class BossRaidService {
  private STATIC_DATA_URL: string;
  private CACHE_TTL: number;
  constructor(
    private bossRaidRepository: BossRaidRepository,
    private userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRedis() private readonly redis: Redis,
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {
    this.STATIC_DATA_URL = this.configService.get<string>('STATIC_DATA_URL');
    this.CACHE_TTL = Number(this.configService.get<string>('CACHE_TTL'));
    this.saveBossRaidInfo();
  }
  async saveBossRaidInfo() {
    await firstValueFrom(this.httpService.get(this.STATIC_DATA_URL))
      .then(async (result) => {
        const bossRaids = result.data['bossRaids'][0];
        const levels = bossRaids['levels'];
        const bossRaidLimitSeconds = bossRaids['bossRaidLimitSeconds'];
        await this.cacheManager.set('levels', levels, this.CACHE_TTL);
        await this.cacheManager.set(
          'bossRaidLimitSeconds',
          bossRaidLimitSeconds,
          this.CACHE_TTL,
        );
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async enterBossRaid(
    enterBossRaidRequestDto: EnterBossRaidRequestDto,
  ): Promise<EnterBossRaidReponseDto> {
    const { userId, level } = enterBossRaidRequestDto;
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new BadRequestException('INVALID_USER');
    }

    const levelInfo: LevelInfo = await this.getLevelInfo(level);
    if (!levelInfo) {
      throw new BadRequestException('INVALID_LEVEL');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      /*이미 시작한 보스레이드가 있는지 확인*/
      const startedBossRaid = await queryRunner.manager.findOne(BossRaid, {
        relations: { user: true },
        where: {
          endTime: IsNull(),
        },
        order: {
          enterTime: 'desc',
        },
      });

      if (startedBossRaid) {
        const isTimeout = await this.isTimeoutBossRaid(startedBossRaid);
        /*타임아웃 된 보스레이드인지 확인*/
        if (!isTimeout) {
          await queryRunner.rollbackTransaction();
          return { isEntered: false };
        }
      }

      const bossRaid = await queryRunner.manager.save(BossRaid, {
        user,
        level,
      });

      await queryRunner.commitTransaction();
      return { isEntered: true, raidRecordId: bossRaid.id };
    } catch (err) {
      console.error(err);
      await queryRunner.rollbackTransaction();
      return { isEntered: false };
    } finally {
      await queryRunner.release();
    }
  }

  async endBossRaid(
    endBossRaidRequestDto: EndBossRaidRequestDto,
  ): Promise<void> {
    const { userId, raidRecordId } = endBossRaidRequestDto;
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
      throw new BadRequestException('ALREADY_END');
    }

    const levelInfo = await this.getLevelInfo(bossRaid.level);
    const score = levelInfo['score'];
    if (!score) {
      throw new BadRequestException('INVALID_SCORE');
    }

    const isTimeout = await this.isTimeoutBossRaid(bossRaid);
    if (isTimeout) {
      throw new BadRequestException('TIME_OUT');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ UNCOMMITTED');
    try {
      bossRaid.endTime = new Date();
      bossRaid.score = score;
      await queryRunner.manager.save(BossRaid, bossRaid);

      user.totalScore += score;
      const updatedUser = await queryRunner.manager.save(User, user);

      await queryRunner.commitTransaction();
      await this.redis.zadd('rank', updatedUser.totalScore, updatedUser.id);
    } catch (err) {
      console.error(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getBossRaidStatus(): Promise<GetBossRaidStatusResponseDto> {
    const startedBossraid = await this.bossRaidRepository.isStartedBosRaid();
    const isTimeout = await this.isTimeoutBossRaid(startedBossraid);
    if (isTimeout) {
      return { canEnter: true };
    }
    return { canEnter: false, enteredUserId: startedBossraid.user.id };
  }

  async getBossRaidRank(userId: number) {
    const topRankerInfoList = await this.getTopRankerInfoList();
    const getMyRankingInfo = await this.getMyRankingInfo(userId);

    return { topRankerInfoList, getMyRankingInfo };
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

  async changeToRankingInfoType(userId: number): Promise<RankingInfo> {
    const score = Number(await this.redis.zscore('rank', userId));
    return {
      ranking: await this.redis.zrevrank('rank', userId),
      userId,
      totalScore: score,
    };
  }

  async getLevelInfo(level: number) {
    let levels: LevelInfo[] = await this.cacheManager.get('levels');
    if (!levels) {
      await this.saveBossRaidInfo();
      levels = await this.cacheManager.get('levels');
    }
    return levels.filter((value) => value['level'] === level)[0];
  }

  async isTimeoutBossRaid(bossRaid: BossRaid): Promise<boolean> {
    const now = new Date();
    const enterTime = bossRaid.enterTime;

    let bossRaidLimitSeconds: number = await this.cacheManager.get(
      'bossRaidLimitSeconds',
    );
    if (!bossRaidLimitSeconds) {
      await this.saveBossRaidInfo();
      bossRaidLimitSeconds = await this.cacheManager.get(
        'bossRaidLimitSeconds',
      );
    }
    enterTime.setSeconds(
      bossRaid.enterTime.getSeconds() + bossRaidLimitSeconds,
    );

    if (now < enterTime) {
      return false;
    }
    return true;
  }
}
