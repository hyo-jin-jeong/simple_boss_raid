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

@Injectable()
export class BossRaidService {
  constructor(
    private bossRaidRepository: BossRaidRepository,
    private userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

  async startBossRaid(userId: number, level: number): Promise<BossRaid> | null {
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

  async endBossRaid(userId: number, raidRecordId: number) {
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
    await this.bossRaidRepository.updateBossRaid(
      user,
      bossRaid,
      score,
      bossRaidLimitSeconds,
    );
  }
}
