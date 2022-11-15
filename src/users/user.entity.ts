import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BossRaid } from '../bossRaid/bossRaid.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'total_score', default: 0 })
  totalScore: number;

  @OneToMany(() => BossRaid, (bossRaid) => bossRaid.user)
  bossRaids: BossRaid[];
}
