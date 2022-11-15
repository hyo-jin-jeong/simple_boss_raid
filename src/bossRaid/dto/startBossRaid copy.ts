import { IsNotEmpty } from 'class-validator';
export class EndBossRaidDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  raidRecordId: number;
}
