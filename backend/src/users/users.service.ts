import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import {
  FindUsersDto,
  PaginatedUsersResponse,
  UpdateUserDto,
} from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}


  async findAll(query: FindUsersDto): Promise<PaginatedUsersResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'id',
      sortOrder = 'ASC',
    } = query;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query builder
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Add search conditions if search term is provided
    if (search) {
      queryBuilder.where(
        '(user.username ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Add sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    // Add pagination
    queryBuilder.skip(offset).take(limit);

    // Get users and total count
    const [users, total] = await queryBuilder.getManyAndCount();

    // Remove password from results
    const data = users.map((user) => {
      const { password, ...result } = user;
      return result;
    });

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Check if username or email already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // Create new user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      wallet: 0,
      role: 'user',
    });

    await this.userRepository.save(user);

    // Remove password from response
    const { password, ...result } = user;
    return result;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if username or email already exists (if they're being updated)
    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.userRepository.findOne({
        where: [
          ...(updateUserDto.username
            ? [{ username: updateUserDto.username }]
            : []),
          ...(updateUserDto.email ? [{ email: updateUserDto.email }] : []),
        ],
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Username or email already exists');
      }
    }

    // If password is being updated, hash it
    let updatedUserData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updatedUserData.password = await bcrypt.hash(
        updateUserDto.password,
        salt,
      );
    }

    // Update user
    await this.userRepository.update(id, updatedUserData);

    // Get updated user
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found after update`);
    }
    const { password, ...result } = updatedUser;
    return result;
  }
  async withdrawal(
    id: string,
    amount: number,
    description?: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if user has sufficient balance
    if (user.wallet < amount) {
      throw new BadRequestException(
        `Insufficient balance for withdrawal of ${amount}`,
      );
    }

    // Update user balance
    const updatedBalance = user.wallet - amount;
    await this.userRepository.update(id, { wallet: updatedBalance });

    // Create transaction record
    await this.transactionRepository.save({
      userId: id,
      amount: amount,
      type: 'withdrawal',
      timestamp: new Date(),
      description: description || 'Withdrawal transaction',
      balanceAfter: updatedBalance,
    });

    // Get updated user
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new NotFoundException(
        `User with ID ${id} not found after withdrawal`,
      );
    }

    const { password, ...result } = updatedUser;
    return result;
  }

  async deposit(
    id: string,
    amount: number,
    description?: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Validate deposit amount
    if (amount <= 0) {
      throw new BadRequestException('Deposit amount must be positive');
    }

    // Update user balance
    const updatedBalance = user.wallet + amount;
    await this.userRepository.update(id, { wallet: updatedBalance });

    // Create transaction record
    await this.transactionRepository.save({
      userId: id,
      amount: amount,
      type: 'deposit',
      timestamp: new Date(),
      description: description || 'Deposit transaction',
      balanceAfter: updatedBalance,
    });

    // Get updated user
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found after deposit`);
    }

    const { password, ...result } = updatedUser;
    return result;
  }
  
  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.remove(user);
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.findOne(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }

    return null;
  }
}
