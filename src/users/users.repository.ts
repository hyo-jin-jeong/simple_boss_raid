import { CustomRepository } from 'src/db/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@CustomRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(): Promise<User> {
    const user = this.create();
    await this.save(user);
    return user;
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.findOne({
      where: { id },
      relations: { bossRaids: true },
    });
    return user;
  }
}
