export class getUserResponseDto {
  totalScore: number;
  bossRaidHistory: BossRaidHistory[];
}

interface BossRaidHistory {
  raidRecordId: number;
  score: number;
  enterTime: string;
  endTime: string | null;
}
