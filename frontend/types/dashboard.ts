// src/types/dashboard.ts
export interface GameStatistics {
  totalGames: number;
  activeGames: number;
  completedGames: number;
  totalBets: number;
  totalBetAmount: number;
  totalWinAmount: number;
  totalProfitLoss: number;
  averageBetsPerGame: number;
  popularBetTypes: Array<{
    type: string;
    count: number;
    percentage: string;
  }>;
  winRateByBetType: Array<{
    type: string;
    totalBets: number;
    winRate: string;
  }>;
  gamesByDuration: Array<{
    duration: string;
    count: number;
    percentage: string;
  }>;
  recentActivity: {
    last24Hours: ActivityStat;
    last7Days: ActivityStat;
  };
}

export interface ActiveGame {
  id: string;
  duration: string;
  period: string;
  end_time: string;
  total_bets: number;
  total_bet_amount: number;
  status: string;
}
export interface Transaction{
  id:string,
  user_id:string,
  type:string,
  amount:string,
  timestamp:string,
  description:string,
  status:string
}

export interface RecentResult {
  id: string;
  number: number;
  color: string;
  size: string;
  timestamp: string;
  game: {
    duration: string;
  };
}

export interface ActivityStat {
  games: number;
  bets: number;
  betAmount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface DashboardState {
  statistics: GameStatistics | null;
  activeGames: ActiveGame[];
  recentResults: RecentResult[];
  transactions:Transaction[]
  loading: boolean;
  error: string | null;
  connectionStatus: string;
  refreshing: boolean;
}