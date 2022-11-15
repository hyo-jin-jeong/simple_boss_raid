import { IsNotEmpty } from 'class-validator';
export class StartBossRaidDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  level: number;
}
