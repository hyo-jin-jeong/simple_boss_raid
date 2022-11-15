import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from 'src/users/user.entity';

@Entity('boss_raids')
export class BossRaid extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  score: number;

  @CreateDateColumn({
    name: 'enter_time',
  })
  enterTime: Date;

  @Column({ name: 'end_time', nullable: true })
  endTime: Date;

  @ManyToOne(() => User, (user) => user.bossRaids)
  user: User;
}
