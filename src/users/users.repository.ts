import { CustomRepository } from 'src/db/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@CustomRepository(User)
export class UserRepository extends Repository<User> {
  async createUser() {
    const user = this.create();
    await this.save(user);
    return user;
  }
}
