import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export enum GameDuration {
  THIRTY_SECONDS = '30s',
  ONE_MINUTE = '1m',
  THREE_MINUTES = '3m',
  FIVE_MINUTES = '5m',
}

export class CreateGameDto {
  @IsNotEmpty()
  @IsEnum(GameDuration)
  duration: GameDuration;
}