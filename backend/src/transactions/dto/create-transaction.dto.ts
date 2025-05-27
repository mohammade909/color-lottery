import { IsString, IsUUID, IsNumber, IsIn, IsOptional, IsPositive, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  userId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsIn(['deposit', 'withdrawal'])
  type: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;
}