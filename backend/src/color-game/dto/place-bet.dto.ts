import { IsNotEmpty, IsString, IsNumber, IsEnum, Min } from 'class-validator';

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

export class PlaceBetDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  period_id: string;

  @IsNotEmpty()
  @IsString()
  period: string;

  @IsNotEmpty()
  @IsEnum(BetType)
  bet_type: BetType;

  @IsNotEmpty()
  @IsString()
  bet_value: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  multiplier: number;
}