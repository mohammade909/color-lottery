import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  FindUsersDto,
  PaginatedUsersResponse,
  UpdateUserDto,
} from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  async findAllUsers(
    @Query() query: FindUsersDto,
  ): Promise<PaginatedUsersResponse> {
    return this.usersService.findAll(query);
  }

  // Move specific routes BEFORE parameterized routes
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    const userId = req.user.id || req.user.sub;

    return this.usersService.findById(userId);
  }

  @Get('deposits/:id') // Fixed typo: "depoists" -> "deposits"
  @UseGuards(JwtAuthGuard)
  getDeposits(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('withdrawal/:id') // Fixed typo: "withdrawal" -> "withdrawals"
  @UseGuards(JwtAuthGuard)
  getWithdrawals(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // Parameterized routes should come AFTER specific routes
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}