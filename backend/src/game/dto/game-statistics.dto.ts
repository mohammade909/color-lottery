// Create this file: src/game/dto/game-statistics.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class BetTypeStatDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  percentage: string;
}

export class WinRateStatDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  winRate: string;

  @ApiProperty()
  totalBets: number;
}

export class DurationStatDto {
  @ApiProperty()
  duration: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  percentage: string;
}

export class ActivityStatDto {
  @ApiProperty()
  games: number;

  @ApiProperty()
  bets: number;

  @ApiProperty()
  betAmount: number;
}

export class RecentActivityDto {
  @ApiProperty({ type: ActivityStatDto })
  last24Hours: ActivityStatDto;

  @ApiProperty({ type: ActivityStatDto })
  last7Days: ActivityStatDto;
}

export class GameStatisticsDto {
  @ApiProperty()
  totalGames: number;

  @ApiProperty()
  activeGames: number;

  @ApiProperty()
  completedGames: number;

  @ApiProperty()
  totalBets: number;

  @ApiProperty()
  totalBetAmount: number;

  @ApiProperty()
  totalWinAmount: number;

  @ApiProperty()
  totalProfitLoss: number;

  @ApiProperty()
  averageBetsPerGame: number;

  @ApiProperty({ type: [BetTypeStatDto] })
  popularBetTypes: BetTypeStatDto[];

  @ApiProperty({ type: [WinRateStatDto] })
  winRateByBetType: WinRateStatDto[];

  @ApiProperty({ type: [DurationStatDto] })
  gamesByDuration: DurationStatDto[];

  @ApiProperty({ type: RecentActivityDto })
  recentActivity: RecentActivityDto;
}

export class GameFilterOptionsDto {
  @ApiProperty({ required: false })
  active?: boolean;

  @ApiProperty({ required: false })
  duration?: string;

  @ApiProperty({ required: false, default: 50 })
  limit?: number;
}

export class BetStatisticsDto {
  @ApiProperty()
  totalBets: number;

  @ApiProperty()
  totalBetAmount: number;

  @ApiProperty()
  totalWinAmount: number;

  @ApiProperty()
  winningBets: number;

  @ApiProperty()
  losingBets: number;

  @ApiProperty()
  winRate: string;

  @ApiProperty()
  profitLoss: number;

  @ApiProperty()
  averageBetPerGame?: string;
}

export class UserStatisticsDto extends BetStatisticsDto {
  @ApiProperty()
  netProfitLoss: number;
}

export class DurationStatisticsDto {
  @ApiProperty()
  duration: string;

  @ApiProperty()
  totalGames: number;

  @ApiProperty()
  activeGames: number;

  @ApiProperty()
  completedGames: number;

  @ApiProperty({ type: BetStatisticsDto, nullable: true })
  statistics: BetStatisticsDto | null;
}

// Response DTOs
export class StandardResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data?: T;

  @ApiProperty()
  total?: number;

  @ApiProperty()
  message?: string;

  @ApiProperty()
  serverTime: string;
}

export class GameStatisticsResponseDto extends StandardResponseDto<GameStatisticsDto> {}

export class BetStatisticsResponseDto extends StandardResponseDto<{
  bets: any[];
  statistics: BetStatisticsDto;
}> {}

export class UserStatisticsResponseDto extends StandardResponseDto<{
  bets: any[];
  userStatistics: UserStatisticsDto;
}> {}