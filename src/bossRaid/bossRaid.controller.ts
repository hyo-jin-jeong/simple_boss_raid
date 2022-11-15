import { Body, Controller, Post } from '@nestjs/common';

import { BossRaidService } from './bossRaid.service';

@Controller('bossRaid')
export class BossRaidController {
  constructor(private bossRaidService: BossRaidService) {}

  @Post('enter')
  async startBossRaid(
    @Body('userId') userId: number,
    @Body('level') level: number,
  ) {
    const bossRaid = await this.bossRaidService.startBossRaid(userId, level);
    if (!bossRaid) {
      return { isEntered: false };
    }
    return { isEntered: true, raidRecordId: bossRaid.id };
  }
}
