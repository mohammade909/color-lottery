import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find();
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
