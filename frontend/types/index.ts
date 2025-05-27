export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export interface Message {
  senderId: string;
  message: string;
  private: boolean;
  targetId?: string;
  timestamp: Date;
}

export interface LiveData {
  timestamp: Date;
  value: number;
  status: string;
}


export enum GameDuration {
  THIRTY_SECONDS = '30s',
  ONE_MINUTE = '1m',
  THREE_MINUTES = '3m',
  FIVE_MINUTES = '5m',
}

export enum BetType {
  COLOR = 'color',
  NUMBER = 'number',
  SIZE = 'size',
}

export enum ColorValue {
  RED = 'red',
  GREEN = 'green',
  BLACK = 'black',
}

export enum SizeValue {
  BIG = 'big',
  SMALL = 'small',
}

export interface ColorGame {
  id: string;
  period: string;
  duration: GameDuration;
  end_time: string;
  active: boolean;
  total_bets: number;
  total_bet_amount: number;
  game_results?: GameResult[];
}

export interface UserBet {
  id: string;
  user_id: string;
  period_id: string;
  period: string;
  bet_type: BetType;
  bet_value: string;
  amount: number;
  multiplier: number;
  total_amount: number;
  result?: 'win' | 'lose';
  win_amount?: number;
  timestamp: string;
}

export interface GameResult {
  id?: string;
  period_id: string;
  number: number;
  color: ColorValue;
  size: SizeValue;
  description: string;
  timestamp?: string;
}

export interface PlaceBetDto {
  user_id: string;
  period_id: string;
  bet_type: BetType;
  bet_value: string;
  amount: number;
}

export interface User {
  id: string;
  username: string;
  role:string;
  email: string;
  wallet: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const MULTIPLIERS = {
  color: {
    red: 2,
    green: 14,
    black: 2,
  },
  number: {
    '0': 9,
    '1': 9,
    '2': 9,
    '3': 9,
    '4': 9,
    '5': 9,
    '6': 9,
    '7': 9,
    '8': 9,
    '9': 9,
  },
  size: {
    big: 2,
    small: 2,
  },
};



export interface ActivityStat {
  games: number;
  bets: number;
  betAmount: number;
}

export interface ActiveGame {
  id: string;
  period: string;
  duration: string;
  end_time: string;
  active: boolean;
  total_bets: number;
  total_bet_amount: number;
}

export interface RecentResult {
  id: string;
  period_id: string;
  number: number;
  color: string;
  size: string;
  description: string;
  timestamp: string;
  duration:string
  game:ActiveGame
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
  serverTime: string;
}
