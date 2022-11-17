import { Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserResponseDTO } from './dto/createUser';
import { getUserResponseDto } from './dto/getUser';

import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('/')
  async createUser(): Promise<CreateUserResponseDTO> {
    return await this.userService.createUser();
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: number): Promise<getUserResponseDto> {
    return await this.userService.getUser(userId);
  }
}
