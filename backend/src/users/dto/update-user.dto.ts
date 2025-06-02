import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { User } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly username?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  readonly password?: string;
}

export class FindUsersDto {
  page?: number = 1;
  limit?: number = 10;
  search?: string;
  sortBy?: string = 'id';
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

// Response interface
export interface PaginatedUsersResponse {
  data: Partial<User>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}