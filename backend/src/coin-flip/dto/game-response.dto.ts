import { IsNumber } from 'class-validator';
import { BetChoice, GameResult, GameStatus } from '../entities/coin-game.entity';


export class GameResponseDto {
  id: number;
  user_id: number;
  bet_amount: number;
  bet_choice: BetChoice;
  result?: GameResult;
  won_amount: number;
  status: GameStatus;
  created_at: Date;
}

// src/modules/game/dto/game-result.dto.ts
export class GameResultDto {
  gameId: number;
  userId: number;
  betChoice: BetChoice;
  result: GameResult;
  betAmount: number;
  wonAmount: number;
  isWin: boolean;
  newBalance: number;
}


export class FlipCoinDto {
  @IsNumber()
  gameId: number;
}