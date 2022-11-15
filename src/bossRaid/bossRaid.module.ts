import { CacheModule, Module } from '@nestjs/common';

import { BossRaidController } from './bossRaid.controller';
import { BossRaidRepository } from './bossRaid.repository';
import { BossRaidService } from './bossRaid.service';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { TypeOrmExModule } from 'src/db/typeorm-ex.module';
import { UserRepository } from 'src/users/users.repository';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([BossRaidRepository, UserRepository]),
    CacheModule.register({ isGlobal: true }),
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
      },
    }),
    HttpModule,
  ],
  controllers: [BossRaidController],
  providers: [BossRaidService],
})
export class BossRaidModule {}
