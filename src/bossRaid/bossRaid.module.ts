import { BossRaidController } from './bossRaid.controller';
import { BossRaidRepository } from './bossRaid.repository';
import { BossRaidService } from './bossRaid.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmExModule } from 'src/db/typeorm-ex.module';
import { UserRepository } from 'src/users/users.repository';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([BossRaidRepository, UserRepository]),
    HttpModule,
  ],
  controllers: [BossRaidController],
  providers: [BossRaidService],
})
export class BossRaidModule {}
