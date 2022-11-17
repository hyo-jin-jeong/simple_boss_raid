import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateUserResponseDTO } from './dto/createUser';
import { UserRepository } from './users.repository';
import { getUserResponseDto } from './dto/getUser';

@Injectable()
export class UsersService {
  constructor(private userRepository: UserRepository) {}

  async createUser(): Promise<CreateUserResponseDTO> {
    const user = await this.userRepository.createUser();
    return { userId: user.id };
  }
  async getUser(id: number): Promise<getUserResponseDto> {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new BadRequestException('INVALID_USER');
    }
    const totalScore = user.totalScore;
    const bossRaidHistory = user.bossRaids.map((bossRaid) => {
      const { id, score, enterTime, endTime } = bossRaid;
      const bossRaidHistory = {
        raidRecordId: id,
        score,
        enterTime: enterTime.toString(),
        endTime: endTime ? endTime.toString() : null,
      };
      return bossRaidHistory;
    });
    return { totalScore, bossRaidHistory };
  }
}
