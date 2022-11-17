import { IsNotEmpty } from 'class-validator';
export class EndBossRaidRequestDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  raidRecordId: number;
}
