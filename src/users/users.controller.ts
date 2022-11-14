import { Controller, Post } from '@nestjs/common';

import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('/')
  async createUser() {
    const user = await this.userService.createUser();
    return { userId: user.id };
  }
}
