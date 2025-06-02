// src/modules/game/game.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { CreateGameDto } from './dto/create-game.dto';
import { GameResponseDto, GameResultDto } from './dto/game-response.dto';
import { Game, GameStatus, GameResult } from './entities/coin-game.entity';
import { User } from 'src/users/entities/user.entity';
import { Transaction } from 'src/users/entities/transaction.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async createGame(
    userId: string,
    createGameDto: CreateGameDto,
  ): Promise<GameResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('id', userId);
      // Check user balance
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId } as any,
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      console.log('usrer    ', user);
      if (user.wallet < createGameDto.bet_amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Deduct bet amount from user wallet
      user.wallet -= createGameDto.bet_amount;
      await queryRunner.manager.save(user);

      // Create game record
      const game = this.gameRepository.create({
        user_id: userId as any,
        bet_amount: createGameDto.bet_amount,
        bet_choice: createGameDto.bet_choice,
        status: GameStatus.PENDING,
      });

      const savedGame = await queryRunner.manager.save(game);

      await queryRunner.commitTransaction();

      return this.mapToResponseDto(savedGame);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async flipCoin(gameId: number, userId: number): Promise<GameResultDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the game
      const game = await queryRunner.manager.findOne(Game, {
        where: { id: gameId, user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!game) {
        throw new NotFoundException('Game not found');
      }

      if (game.status !== GameStatus.PENDING) {
        throw new BadRequestException('Game already completed');
      }

      // Generate random result (0 = heads, 1 = tails)
      const randomResult = Math.random() < 0.5;
      const coinResult = randomResult ? GameResult.HEADS : GameResult.TAILS;

      // Check if user won - convert BetChoice to GameResult for comparison
      const betChoiceAsGameResult = game.bet_choice as unknown as GameResult;
      const isWin = betChoiceAsGameResult === coinResult;
      const wonAmount = isWin ? game.bet_amount * 2 : 0;

      // Update game
      game.result = coinResult;
      game.won_amount = wonAmount;
      game.status = GameStatus.COMPLETED;

      await queryRunner.manager.save(game);

      // Get user for balance update
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId } as any,
        lock: { mode: 'pessimistic_write' },
      });

      // Check if user exists
      if (!user) {
        throw new NotFoundException('User not found');
      }

      let newBalance = user.wallet;

      // If user won, add winnings to wallet and create win transaction
      if (isWin && wonAmount > 0) {
        user.wallet += wonAmount;
        newBalance = user.wallet;
        await queryRunner.manager.save(user);

        const winTransaction = this.transactionRepository.create({
          user_id: userId.toString(), // Convert number to string
          amount: wonAmount,
          type: 'win',
          description: `Won game #${gameId}`,
          status: 'completed',
        });

        await queryRunner.manager.save(winTransaction);
      }

      await queryRunner.commitTransaction();

      return {
        gameId: game.id,
        userId: game.user_id,
        betChoice: game.bet_choice,
        result: coinResult,
        betAmount: game.bet_amount,
        wonAmount: wonAmount,
        isWin: isWin,
        newBalance: newBalance,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getGameById(gameId: number, userId: number): Promise<GameResponseDto> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId, user_id: userId },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.mapToResponseDto(game);
  }

  async getUserGames(
    userId: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    return games.map((game) => this.mapToResponseDto(game));
  }

  async getGameStats(userId: number): Promise<any> {
    const stats = await this.gameRepository
      .createQueryBuilder('game')
      .select([
        'COUNT(*) as total_games',
        'COUNT(CASE WHEN game.won_amount > 0 THEN 1 END) as games_won',
        'COUNT(CASE WHEN game.won_amount = 0 AND game.status = :completed THEN 1 END) as games_lost',
        'SUM(game.bet_amount) as total_bet',
        'SUM(game.won_amount) as total_won',
        'SUM(game.won_amount) - SUM(game.bet_amount) as net_profit',
      ])
      .where('game.user_id = :userId', { userId })
      .andWhere('game.status = :completed', { completed: GameStatus.COMPLETED })
      .getRawOne();

    return {
      totalGames: parseInt(stats.total_games) || 0,
      gamesWon: parseInt(stats.games_won) || 0,
      gamesLost: parseInt(stats.games_lost) || 0,
      totalBet: parseFloat(stats.total_bet) || 0,
      totalWon: parseFloat(stats.total_won) || 0,
      netProfit: parseFloat(stats.net_profit) || 0,
      winRate:
        stats.total_games > 0
          ? (parseInt(stats.games_won) / parseInt(stats.total_games)) * 100
          : 0,
    };
  }

  private mapToResponseDto(game: Game): GameResponseDto {
    return {
      id: game.id,
      user_id: game.user_id,
      bet_amount: game.bet_amount,
      bet_choice: game.bet_choice,
      result: game.result,
      won_amount: game.won_amount,
      status: game.status,
      created_at: game.created_at,
    };
  }
}
