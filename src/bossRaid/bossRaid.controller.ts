import { Body, Controller, Get, Patch, Post } from '@nestjs/common';

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

  @Patch('end')
  async endBossRaid(
    @Body('userId') userId: number,
    @Body('raidRecordId') raidRecordId: number,
  ) {
    this.bossRaidService.endBossRaid(userId, raidRecordId);
  }

  @Get()
  async getBossRaidStatus() {
    const bossRaidStatus = await this.bossRaidService.getBossRaidStatus();
    return {
      canEnter: !bossRaidStatus,
      enteredUserId: bossRaidStatus ? bossRaidStatus.id : null,
    };
  }

  @Post('topRankerList')
  async getBossRaidRank(@Body('userId') userId: number) {
    const topRankerInfoList = await this.bossRaidService.getTopRankerInfoList();
    const myRankingInfo = await this.bossRaidService.getMyRankingInfo(userId);
    return { topRankerInfoList, myRankingInfo };
  }
}
