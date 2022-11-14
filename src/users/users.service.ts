import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private userRepository: UserRepository) {}

  createUser(): Promise<User> {
    return this.userRepository.createUser();
  }
}
