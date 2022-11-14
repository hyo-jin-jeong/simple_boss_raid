import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BossRaid } from '../bossRaids/bossRaid.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'total_score' })
  totalScore: number;

  @OneToMany(() => BossRaid, (bossRaid) => bossRaid.user)
  bossRaids: BossRaid[];
}
