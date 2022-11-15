import { IsNull, Repository } from 'typeorm';

import { BossRaid } from './bossRaid.entity';
import { CustomRepository } from 'src/db/typeorm-ex.decorator';
import { User } from 'src/users/user.entity';

@CustomRepository(BossRaid)
export class BossRaidRepository extends Repository<BossRaid> {
  async createBossRaid(
    user: User,
    score: number,
    bossRaidLimitSeconds: number,
  ): Promise<BossRaid> | null {
    const now = new Date();
    const queryRunner = this.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const isBossRaid = await queryRunner.manager.findOneBy(BossRaid, {
        endTime: IsNull(),
      });
      if (isBossRaid) {
        const enterTime = isBossRaid.enterTime;
        enterTime.setSeconds(
          isBossRaid.enterTime.getSeconds() + bossRaidLimitSeconds,
        );
        if (now < enterTime) {
          await queryRunner.rollbackTransaction();
          return null;
        }
      }
      const bossRaid = this.create({ user, score });
      await bossRaid.save();
      await queryRunner.commitTransaction();
      return bossRaid;
    } catch (err) {
      console.error(err);
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }
}
