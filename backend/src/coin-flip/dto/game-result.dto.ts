import { IsNotEmpty, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ColorValue, SizeValue } from './place-bet.dto';

export class CreateGameResultDto {
  @IsNotEmpty()
  @IsString()
  period_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(9)
  number: number;

  @IsNotEmpty()
  @IsEnum(ColorValue)
  color: ColorValue;

  @IsNotEmpty()
  @IsEnum(SizeValue)
  size: SizeValue;

  @IsString()
  description?: string;
}