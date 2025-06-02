// src/modules/game/dto/create-game.dto.ts
import { IsEnum, IsNumber, IsPositive, Min } from 'class-validator';
import { BetChoice } from '../entities/coin-game.entity';


export class CreateGameDto {
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  bet_amount: number;

  @IsEnum(BetChoice)
  bet_choice: BetChoice;
}

// src/modules/game/dto/game-response.dto.ts
