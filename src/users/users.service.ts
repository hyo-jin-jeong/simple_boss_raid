import { BadRequestException, Injectable } from '@nestjs/common';

import { User } from './user.entity';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private userRepository: UserRepository) {}

  async createUser(): Promise<User> {
    return await this.userRepository.createUser();
  }
  async getUser(id: number): Promise<User> {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new BadRequestException('INVALID_USER');
    }
    return user;
  }
}
