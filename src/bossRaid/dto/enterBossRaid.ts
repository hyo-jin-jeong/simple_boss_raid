import { IsNotEmpty } from 'class-validator';
export class EnterBossRaidRequestDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  level: number;
}

export class EnterBossRaidReponseDto {
  isEntered: boolean;
  raidRecordId?: number;
}
