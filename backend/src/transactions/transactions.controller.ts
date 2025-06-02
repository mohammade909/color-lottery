import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  FindAllTransactionsDto,
  PaginatedTransactionResponse,
} from './dto/find-all-transaction.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get('with-user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get transactions with user information' })
  async findAllWithUser(
    @Query() query: FindAllTransactionsDto,
  ): Promise<PaginatedTransactionResponse> {
    return this.transactionsService.findAllWithUser(query);
  }
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiQuery({ name: 'user_id', required: false, type: String })
  @ApiQuery({ name: 'date_from', required: false, type: String })
  @ApiQuery({ name: 'date_to', required: false, type: String })
  async getStatistics(
    @Query('user_id') user_id?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
  ) {
    return this.transactionsService.getStatistics({
      user_id,
      date_from,
      date_to,
    });
  }
  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string): Promise<Transaction[]> {
    return this.transactionsService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Transaction> {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.transactionsService.remove(id);
  }
}
