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
import {
  EnterBossRaidReponseDto,
  EnterBossRaidRequestDto,
} from './dto/enterBossRaid';
import { EndBossRaidRequestDto } from './dto/endBossRaid';
import { GetBossRaidStatusResponseDto } from './dto/getBossRaidStatus';

@Controller('bossRaid')
export class BossRaidController {
  constructor(private bossRaidService: BossRaidService) {}

  @Post('enter')
  @UsePipes(ValidationPipe)
  async enterBossRaid(
    @Body() enterBossRaidRequestDto: EnterBossRaidRequestDto,
  ): Promise<EnterBossRaidReponseDto> {
    return await this.bossRaidService.enterBossRaid(enterBossRaidRequestDto);
  }

  @Patch('end')
  @UsePipes(ValidationPipe)
  async endBossRaid(@Body() endBossRaiRequestDto: EndBossRaidRequestDto) {
    await this.bossRaidService.endBossRaid(endBossRaiRequestDto);
  }

  @Get()
  async getBossRaidStatus(): Promise<GetBossRaidStatusResponseDto> {
    return await this.bossRaidService.getBossRaidStatus();
  }

  @Post('topRankerList')
  async getBossRaidRank(@Body('userId') userId: number) {
    return await this.bossRaidService.getBossRaidRank(userId);
  }
}
