import { IsString, IsUUID, IsNumber, IsIn, IsOptional, IsPositive, IsDate } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}