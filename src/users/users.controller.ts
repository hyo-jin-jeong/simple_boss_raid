import { Controller, Get, Param, Post } from '@nestjs/common';

import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('/')
  async createUser() {
    const user = await this.userService.createUser();
    return { userId: user.id };
  }
  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    const user = await this.userService.getUser(userId);
    const response = {
      totalScore: user.totalScore,
      bossRaidHistory: user.bossRaids.map((bossRaid) => {
        const { id, ...data } = bossRaid;
        return { raidRecordId: id, ...data };
      }),
    };
    return response;
  }
}
