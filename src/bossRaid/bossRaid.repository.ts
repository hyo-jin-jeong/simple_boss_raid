import { IsNull, Repository } from 'typeorm';

import { BossRaid } from './bossRaid.entity';
import { CustomRepository } from 'src/db/typeorm-ex.decorator';
import { User } from 'src/users/user.entity';

@CustomRepository(BossRaid)
export class BossRaidRepository extends Repository<BossRaid> {
  async createBossRaid(
    user: User,
    level: number,
    bossRaidLimitSeconds: number,
  ): Promise<BossRaid> | null {
    const queryRunner = this.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const notEndBossRaid = await this.getNotEndBoss();
      if (notEndBossRaid) {
        const status = this.isRunningBossRaid(
          notEndBossRaid,
          bossRaidLimitSeconds,
        );
        if (status) {
          await queryRunner.rollbackTransaction();
          return null;
        }
      }
      const bossRaid = this.create({ user, level });
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

  async getBossRaidById(id: number): Promise<BossRaid> | null {
    return await this.findOne({ relations: { user: true }, where: { id } });
  }

  async updateBossRaid(
    user: User,
    bossRaid: BossRaid,
    score: number,
  ): Promise<void | User> {
    bossRaid.endTime = new Date();
    bossRaid.score = score;
    user.totalScore += score;
    const queryRunner = this.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ UNCOMMITTED');
    try {
      await bossRaid.save();
      await user.save();
      await queryRunner.commitTransaction();
      return user;
    } catch (err) {
      console.error(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getNotEndBoss(): Promise<BossRaid> | null {
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

  isRunningBossRaid(
    bossRaid: BossRaid,
    bossRaidLimitSeconds: number,
  ): User | null {
    const now = new Date();
    if (bossRaid) {
      const enterTime = bossRaid.enterTime;
      enterTime.setSeconds(
        bossRaid.enterTime.getSeconds() + bossRaidLimitSeconds,
      );
      if (now < enterTime) {
        return bossRaid.user;
      }
      return null;
    }
  }
}
