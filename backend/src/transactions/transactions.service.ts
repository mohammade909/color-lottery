import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { User } from '../users/entities/user.entity';
import { FindAllTransactionsDto, PaginatedTransactionResponse } from './dto/find-all-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAllWithUser(filters: FindAllTransactionsDto = {}): Promise<PaginatedTransactionResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      user_id,
      date_from,
      date_to,
      sort_by = 'timestamp',
      sort_order = 'DESC',
    } = filters;

    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (validatedPage - 1) * validatedLimit;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('users', 'user', 'user.id = transaction.user_id')
      .select([
        'transaction.*',
        'user.email',
        'user.username', // Add user fields you need
      ]);

    this.applyFilters(queryBuilder, {
      search,
      type,
      status,
      user_id,
      date_from,
      date_to,
    });

    this.applySorting(queryBuilder, sort_by, sort_order);

    const total = await queryBuilder.getCount();
    queryBuilder.skip(offset).take(validatedLimit);

    const data = await queryBuilder.getRawMany();

    const totalPages = Math.ceil(total / validatedLimit);

    return {
      data: data as any, // You might want to map this to a proper DTO
      meta: {
        total,
        page: validatedPage,
        limit: validatedLimit,
        totalPages,
        hasNextPage: validatedPage < totalPages,
        hasPreviousPage: validatedPage > 1,
      },
    };
  }
// Complete implementation for the missing methods

private applySorting(
  queryBuilder: SelectQueryBuilder<Transaction>, 
  sort_by: string, 
  sort_order: string
): void {
  const allowedSortFields = ['timestamp', 'amount', 'type', 'status', 'user_id'];
  const validSortBy = allowedSortFields.includes(sort_by) ? sort_by : 'timestamp';
  const validSortOrder = ['ASC', 'DESC'].includes(sort_order.toUpperCase()) 
    ? sort_order.toUpperCase() as 'ASC' | 'DESC' 
    : 'DESC';

  queryBuilder.orderBy(`transaction.${validSortBy}`, validSortOrder);
  
  // Add secondary sort by id for consistency when primary sort values are the same
  if (validSortBy !== 'timestamp') {
    queryBuilder.addOrderBy('transaction.timestamp', 'DESC');
  }
}

private applyFilters(
  queryBuilder: SelectQueryBuilder<Transaction>, 
  filters: { 
    search: string | undefined; 
    type: "deposit" | "withdrawal" | undefined; 
    status: string | undefined; 
    user_id: string | undefined; 
    date_from: string | undefined; 
    date_to: string | undefined; 
  }
): void {
  const { search, type, status, user_id, date_from, date_to } = filters;

  // Search filter - searches in description and user_id
  if (search && search.trim()) {
    const searchTerm = search.trim();
    queryBuilder.andWhere(
      '(LOWER(transaction.description) LIKE LOWER(:search) OR transaction.user_id::text LIKE :search)',
      { search: `%${searchTerm}%` }
    );
  }

  // Type filter
  if (type && ['deposit', 'withdrawal'].includes(type)) {
    queryBuilder.andWhere('transaction.type = :type', { type });
  }

  // Status filter
  if (status && status.trim()) {
    queryBuilder.andWhere('transaction.status = :status', { status: status.trim() });
  }

  // User ID filter
  if (user_id && user_id.trim()) {
    queryBuilder.andWhere('transaction.user_id = :user_id', { user_id: user_id.trim() });
  }

  // Date range filters
  if (date_from) {
    try {
      const fromDate = new Date(date_from);
      if (!isNaN(fromDate.getTime())) {
        queryBuilder.andWhere('transaction.timestamp >= :date_from', { date_from: fromDate });
      }
    } catch (error) {
      console.warn('Invalid date_from format:', date_from);
    }
  }

  if (date_to) {
    try {
      const toDate = new Date(date_to);
      if (!isNaN(toDate.getTime())) {
        // Set to end of day
        toDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('transaction.timestamp <= :date_to', { date_to: toDate });
      }
    } catch (error) {
      console.warn('Invalid date_to format:', date_to);
    }
  }
}

  // Get transaction statistics
  async getStatistics(filters?: {
    user_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{
    totalTransactions: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalAmount: number;
    pendingTransactions: number;
  }> {
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction');

    if (filters?.user_id) {
      queryBuilder.andWhere('transaction.user_id = :user_id', { user_id: filters.user_id });
    }

    if (filters?.date_from) {
      queryBuilder.andWhere('transaction.timestamp >= :date_from', {
        date_from: new Date(filters.date_from),
      });
    }

    if (filters?.date_to) {
      queryBuilder.andWhere('transaction.timestamp <= :date_to', {
        date_to: new Date(filters.date_to),
      });
    }

    const result = await queryBuilder
      .select([
        'COUNT(*) as totalTransactions',
        'COUNT(CASE WHEN type = \'deposit\' THEN 1 END) as totalDeposits',
        'COUNT(CASE WHEN type = \'withdrawal\' THEN 1 END) as totalWithdrawals',
        'SUM(amount) as totalAmount',
        'COUNT(CASE WHEN status = \'pending\' THEN 1 END) as pendingTransactions',
      ])
      .getRawOne();

    return {
      totalTransactions: parseInt(result.totalTransactions) || 0,
      totalDeposits: parseInt(result.totalDeposits) || 0,
      totalWithdrawals: parseInt(result.totalWithdrawals) || 0,
      totalAmount: parseFloat(result.totalAmount) || 0,
      pendingTransactions: parseInt(result.pendingTransactions) || 0,
    };
  }


  async findByUserId(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { user_id: userId },
      order: { timestamp: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    try {
      const { userId, amount, type, description } = createTransactionDto;
      console.log('Transaction data received:', createTransactionDto);

      // Find the user
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      let balanceAfter: number;

      // Process based on transaction type
      if (type === 'deposit') {
        if (amount <= 0) {
          throw new BadRequestException('Deposit amount must be positive');
        }
        balanceAfter = user.wallet + amount;
        // Update user balance
        await this.userRepository.update(userId, { wallet: balanceAfter });
      } else if (type === 'withdrawal') {
        if (amount <= 0) {
          throw new BadRequestException('Withdrawal amount must be positive');
        }
        if (user.wallet < amount) {
          throw new BadRequestException(
            `Insufficient balance for withdrawal of ${amount}`,
          );
        }
        balanceAfter = user.wallet - amount;
        // Update user balance
        await this.userRepository.update(userId, { wallet: balanceAfter });
      } else {
        throw new BadRequestException(
          'Transaction type must be either "deposit" or "withdrawal"',
        );
      }

      // Create transaction record
      const transaction = this.transactionRepository.create({
        user_id: userId,
        amount,
        type,
        description:
          description ||
          `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
        timestamp: new Date(),
        status:type ==='deposit' ? 'complete' :'pending'
        // Uncommented this line
      });

      console.log('Attempting to save transaction:', transaction);
      const savedTransaction =
        await this.transactionRepository.save(transaction);
      console.log('Transaction saved successfully:', savedTransaction);
      return savedTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error; // Re-throw to allow NestJS exception filters to handle it
    }
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);

    // Don't allow changing the transaction type or amount as it would affect user's balance
    if (updateTransactionDto.type || updateTransactionDto.amount) {
      throw new BadRequestException(
        'Cannot change transaction type or amount after creation',
      );
    }

    // Only allow updating the description
    if (updateTransactionDto.description) {
      await this.transactionRepository.update(id, {
        description: updateTransactionDto.description,
      });
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    // In a real financial system, you typically wouldn't delete transactions
    // But for the sake of completeness, here's the implementation
    const transaction = await this.findOne(id);
    await this.transactionRepository.remove(transaction);
  }
}
