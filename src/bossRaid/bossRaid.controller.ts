import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { BossRaidService } from './bossRaid.service';
import { StartBossRaidDto } from './dto/startBossRaid';
import { EndBossRaidDto } from './dto/startBossRaid copy';

@Controller('bossRaid')
export class BossRaidController {
  constructor(private bossRaidService: BossRaidService) {}

  @Post('enter')
  @UsePipes(ValidationPipe)
  async startBossRaid(@Body() startBossRaidDto: StartBossRaidDto) {
    const bossRaid = await this.bossRaidService.startBossRaid(startBossRaidDto);
    if (!bossRaid) {
      return { isEntered: false };
    }
    return { isEntered: true, raidRecordId: bossRaid.id };
  }

  @Patch('end')
  @UsePipes(ValidationPipe)
  async endBossRaid(@Body() endBossRaidDto: EndBossRaidDto) {
    await this.bossRaidService.endBossRaid(endBossRaidDto);
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
