import { IsNull, Repository } from 'typeorm';

import { BossRaid } from './bossRaid.entity';
import { CustomRepository } from 'src/db/typeorm-ex.decorator';
import { User } from 'src/users/user.entity';

@CustomRepository(BossRaid)
export class BossRaidRepository extends Repository<BossRaid> {
  async createBossRaid(user: User, level: number): Promise<BossRaid> {
    const bossRaid = this.create({ user, level });
    await bossRaid.save();

    return bossRaid;
  }

  async getBossRaidById(id: number): Promise<BossRaid> {
    return await this.findOne({ relations: { user: true }, where: { id } });
  }

  async updateEndedBossRaid(bossRaid: BossRaid, score: number) {
    bossRaid.endTime = new Date();
    bossRaid.score = score;
    return await bossRaid.save();
  }

  async isStartedBosRaid(): Promise<BossRaid> {
    return await this.findOne({
      relations: { user: true },
      where: {
        endTime: IsNull(),
      },
      order: {
        enterTime: 'desc',
      },
    });
  }
}
