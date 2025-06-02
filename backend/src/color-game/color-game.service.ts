// import {
//   HttpException,
//   HttpStatus,
//   Injectable,
//   Logger,
//   OnModuleInit,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, Connection } from 'typeorm';
// import { v4 as uuidv4 } from 'uuid';
// import { ColorGame } from './entities/color-game.entity';
// import { UserBet } from './entities/user-bet.entity';
// import { GameResult } from './entities/game-result.entity';
// import {
//   PlaceBetDto,
//   BetType,
//   ColorValue,
//   SizeValue,
// } from './dto/place-bet.dto';
// import { CreateGameDto, GameDuration } from './dto/create-game.dto';
// import { CreateGameResultDto } from './dto/game-result.dto';
// import { Cron, SchedulerRegistry } from '@nestjs/schedule';
// import { format, addSeconds, addMinutes } from 'date-fns';
// import { User } from 'src/users/entities/user.entity';

// @Injectable()
// export class ColorGameService implements OnModuleInit {
//   private readonly logger = new Logger(ColorGameService.name);
//   private readonly multipliers = {
//     color: {
//       red: 2,
//       green: 14,
//       black: 2,
//     },
//     number: {
//       '0': 9,
//       '1': 9,
//       '2': 9,
//       '3': 9,
//       '4': 9,
//       '5': 9,
//       '6': 9,
//       '7': 9,
//       '8': 9,
//       '9': 9,
//     },
//     size: {
//       big: 2,
//       small: 2,
//     },
//   };

//   constructor(
//     @InjectRepository(ColorGame)
//     private colorGameRepository: Repository<ColorGame>,
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//     @InjectRepository(UserBet)
//     private userBetRepository: Repository<UserBet>,
//     @InjectRepository(GameResult)
//     private gameResultRepository: Repository<GameResult>,
//     private connection: Connection,
//     private schedulerRegistry: SchedulerRegistry,
//   ) {}

//   async onModuleInit() {
//     // Start the games when the application starts
//     await this.startAllGames();
//   }

//   async startAllGames() {
//     // Clear any existing games
//     await this.colorGameRepository
//       .createQueryBuilder()
//       .update(ColorGame)
//       .set({ active: false })
//       .execute();

//     // Start each type of game
//     await this.createGame({ duration: GameDuration.THIRTY_SECONDS });
//     await this.createGame({ duration: GameDuration.ONE_MINUTE });
//     await this.createGame({ duration: GameDuration.THREE_MINUTES });
//     await this.createGame({ duration: GameDuration.FIVE_MINUTES });

//     this.logger.log('All games started successfully');
//   }
//   generateUniqueDigitPeriod() {
//     const getRandomDigit = () => Math.floor(Math.random() * 10);

//     let randomFour = '';
//     for (let i = 0; i < 4; i++) {
//       randomFour += getRandomDigit();
//     }

//     const result = `0000000${randomFour}`;
//     return result;
//   }

//   async createGame(createGameDto: CreateGameDto): Promise<ColorGame> {
//     const id = uuidv4();
//     const now = new Date();
//     let endTime: Date;
//     let periodFormat: string;

//     switch (createGameDto.duration) {
//       case GameDuration.THIRTY_SECONDS:
//         endTime = addSeconds(now, 30);
//         periodFormat = 'yyyyMMddHHmmss30s';
//         break;
//       case GameDuration.ONE_MINUTE:
//         endTime = addMinutes(now, 1);
//         periodFormat = 'yyyyMMddHHmm1m';
//         break;
//       case GameDuration.THREE_MINUTES:
//         endTime = addMinutes(now, 3);
//         periodFormat = 'yyyyMMddHHmm3m';
//         break;
//       case GameDuration.FIVE_MINUTES:
//         endTime = addMinutes(now, 5);
//         periodFormat = 'yyyyMMddHHmm5m';
//         break;
//     }

//     const period = this.generateUniqueDigitPeriod();

//     const game = this.colorGameRepository.create({
//       id,
//       period,
//       duration: createGameDto.duration,
//       end_time: endTime,
//       active: true,
//     });

//     const savedGame = await this.colorGameRepository.save(game);

//     // Schedule the end of the game
//     const gameTimeout = setTimeout(
//       () => this.endGame(id),
//       endTime.getTime() - now.getTime(),
//     );

//     try {
//       this.schedulerRegistry.addTimeout(`game-${id}`, gameTimeout);
//     } catch (error) {
//       this.logger.error(`Failed to schedule game end: ${error.message}`);
//     }

//     return savedGame;
//   }

//   async placeBet(placeBetDto: PlaceBetDto): Promise<UserBet> {
//     // Find the active game for the period
//     const game = await this.colorGameRepository.findOne({
//       where: { id: placeBetDto.period_id, active: true },
//     });

//     if (!game) {
//       throw new Error('Game not found or not active');
//     }

//     // Validate the bet
//     this.validateBet(placeBetDto);

//     // Calculate total amount
//     const total_amount = placeBetDto.amount;

//     // Get user to check wallet balance
//     const user = await this.userRepository.findOne({
//       where: { id: placeBetDto.user_id },
//     });

//     if (!user) {
//       throw new Error('User not found');
//     }

//     // Check if user has enough balance
//     if (user.wallet < placeBetDto.amount) {
//       throw new Error('Insufficient wallet balance');
//     }

//     // Create the bet
//     const bet = this.userBetRepository.create({
//       id: uuidv4(),
//       user_id: placeBetDto.user_id,
//       period_id: placeBetDto.period_id,
//       period: placeBetDto.period,
//       bet_type: placeBetDto.bet_type,
//       bet_value: placeBetDto.bet_value,
//       amount: placeBetDto.amount,
//       multiplier: placeBetDto.multiplier,
//       total_amount,
//     });

//     // Update game stats and user wallet atomically
//     await this.connection.transaction(async (manager) => {
//       // Save the bet
//       await manager.save(bet);

//       // Update game total bets and amount
//       await manager.increment(
//         ColorGame,
//         { id: placeBetDto.period_id },
//         'total_bets',
//         1,
//       );

//       await manager
//         .createQueryBuilder()
//         .update(ColorGame)
//         .set({
//           total_bet_amount: () => `total_bet_amount + ${placeBetDto.amount}`,
//         })
//         .where('id = :id', { id: placeBetDto.period_id })
//         .execute();

//       // Deduct the bet amount from user's wallet
//       await manager
//         .createQueryBuilder()
//         .update(User) // Assuming your user entity is named User
//         .set({
//           wallet: () => `wallet - ${placeBetDto.amount}`,
//         })
//         .where('id = :id', { id: placeBetDto.user_id })
//         .execute();
//     });

//     return bet;
//   }
//   private validateBet(placeBetDto: PlaceBetDto): void {
//     const { bet_type, bet_value } = placeBetDto;

//     switch (bet_type) {
//       case BetType.COLOR:
//         if (!Object.values(ColorValue).includes(bet_value as ColorValue)) {
//           throw new Error(`Invalid color value: ${bet_value}`);
//         }
//         break;
//       case BetType.NUMBER:
//         const num = parseInt(bet_value);
//         if (isNaN(num) || num < 0 || num > 9) {
//           throw new Error(`Invalid number value: ${bet_value}`);
//         }
//         break;
//       case BetType.SIZE:
//         if (!Object.values(SizeValue).includes(bet_value as SizeValue)) {
//           throw new Error(`Invalid size value: ${bet_value}`);
//         }
//         break;
//       default:
//         throw new Error(`Invalid bet type: ${bet_type}`);
//     }
//   }

//   private getMultiplier(betType: string, betValue: string): number {
//     return this.multipliers[betType][betValue];
//   }
//   async endGame(gameId: string): Promise<void> {
//     const game = await this.colorGameRepository.findOne({
//       where: { id: gameId, active: true },
//     });

//     if (!game) {
//       this.logger.warn(`Game ${gameId} not found or already ended`);
//       return;
//     }

//     // Generate random result
//     const result = this.generateGameResult();

//     // Save result
//     const gameResult = this.gameResultRepository.create({
//       period_id: gameId,
//       number: result.number,
//       color: result.color,
//       size: result.size,
//       description: `Game ${game.period} ended with number ${result.number}, color ${result.color}, size ${result.size}`,
//       duration: game.duration,
//     });

//     await this.connection.transaction(async (manager) => {
//       // Save the result
//       await manager.save(gameResult);

//       // Process all bets for this game
//       const bets = await this.userBetRepository.find({
//         where: { period_id: gameId },
//       });

//       for (const bet of bets) {
//         const isWin = this.checkWin(bet, result);

//         let winAmount = 0;
//         console.log(isWin)
//         if (isWin) {
//           // Calculate win amount: bet * 2 minus 10% fee
//           const grossWinAmount = bet.total_amount * 2;
//           const fee = grossWinAmount * 0.1; // 10% fee
//           winAmount = grossWinAmount - fee;

//           // Get the user by user_id and update their balance
//           await manager.increment(
//             User,
//             { id: bet.user_id },
//             'wallet',
//             winAmount,
//           );

//           this.logger.log(
//             `User ${bet.user_id} won ${winAmount} (gross: ${grossWinAmount}, fee: ${fee}) from bet ${bet.id}`,
//           );
//         }

//         // Update bet record
//         await manager.update(
//           UserBet,
//           { id: bet.id },
//           {
//             result: isWin ? 'win' : 'lose',
//             win_amount: winAmount,
//           },
//         );
//       }

//       // Mark game as inactive
//       await manager.update(ColorGame, { id: gameId }, { active: false });

//       // Start a new game of the same duration
//       const newGame = await this.createGame({
//         duration: game.duration as GameDuration,
//       });
//       this.logger.log(
//         `Started new ${game.duration} game with ID: ${newGame.id}`,
//       );
//     });

//     // Clean up scheduler
//     try {
//       this.schedulerRegistry.deleteTimeout(`game-${gameId}`);
//     } catch (error) {
//       this.logger.error(`Error removing game timeout: ${error.message}`);
//     }
//   }
//   // async endGame(gameId: string): Promise<void> {
//   //   const game = await this.colorGameRepository.findOne({
//   //     where: { id: gameId, active: true },
//   //   });

//   //   if (!game) {
//   //     this.logger.warn(`Game ${gameId} not found or already ended`);
//   //     return;
//   //   }

//   //   // Generate random result
//   //   const result = this.generateGameResult();

//   //   // Save result
//   //   const gameResult = this.gameResultRepository.create({
//   //     period_id: gameId,
//   //     number: result.number,
//   //     color: result.color,
//   //     size: result.size,
//   //     description: `Game ${game.period} ended with number ${result.number}, color ${result.color}, size ${result.size}`,
//   //     duration: game.duration,
//   //   });

//   //   await this.connection.transaction(async (manager) => {
//   //     // Save the result
//   //     await manager.save(gameResult);

//   //     // Process all bets for this game
//   //     const bets = await this.userBetRepository.find({
//   //       where: { period_id: gameId },
//   //     });

//   //     for (const bet of bets) {
//   //       const isWin = this.checkWin(bet, result);
//   //       const winAmount = isWin ? bet.total_amount : 0;

//   //       await manager.update(
//   //         UserBet,
//   //         { id: bet.id },
//   //         {
//   //           result: isWin ? 'win' : 'lose',
//   //           win_amount: winAmount,
//   //         },
//   //       );

//   //       // Here you would also update the user's balance
//   //       // This depends on your user/wallet implementation
//   //     }

//   //     // Mark game as inactive
//   //     await manager.update(ColorGame, { id: gameId }, { active: false });

//   //     // Start a new game of the same duration
//   //     const newGame = await this.createGame({
//   //       duration: game.duration as GameDuration,
//   //     });
//   //     this.logger.log(
//   //       `Started new ${game.duration} game with ID: ${newGame.id}`,
//   //     );
//   //   });

//   //   // Clean up scheduler
//   //   try {
//   //     this.schedulerRegistry.deleteTimeout(`game-${gameId}`);
//   //   } catch (error) {
//   //     this.logger.error(`Error removing game timeout: ${error.message}`);
//   //   }
//   // }

//   private generateGameResult(): {
//     number: number;
//     color: ColorValue;
//     size: SizeValue;
//   } {
//     const number = Math.floor(Math.random() * 10); // 0-9

//     // Determine color based on number
//     let color: ColorValue;
//     if (number === 0) {
//       color = ColorValue.GREEN;
//     } else if (number % 2 === 0) {
//       color = ColorValue.RED;
//     } else {
//       color = ColorValue.BLACK;
//     }

//     // Determine size
//     const size = number > 4 ? SizeValue.BIG : SizeValue.SMALL;

//     return { number, color, size };
//   }

//   private checkWin(
//     bet: UserBet,
//     result: { number: number; color: string; size: string },
//   ): boolean {
//     switch (bet.bet_type) {
//       case BetType.COLOR:
//         return bet.bet_value === result.color;
//       case BetType.NUMBER:
//         return parseInt(bet.bet_value) === result.number;
//       case BetType.SIZE:
//         return bet.bet_value === result.size;
//       default:
//         return false;
//     }
//   }

//   async getActiveGames(): Promise<ColorGame[]> {
//     return this.colorGameRepository.find({
//       where: { active: true },
//       order: { end_time: 'ASC' },
//     });
//   }

//   async getGameById(id: string): Promise<ColorGame | null> {
//     return this.colorGameRepository.findOne({
//       where: { id },
//       relations: ['game_results'],
//     });
//   }
//   async getGameByDuration(duration: string): Promise<ColorGame | null> {
//     return this.colorGameRepository.findOne({
//       where: { duration },
//       relations: ['game_results'],
//     });
//   }

//   async getGameBets(gameId: string): Promise<UserBet[]> {
//     return this.userBetRepository.find({
//       where: { period_id: gameId },
//       order: { timestamp: 'DESC' },
//     });
//   }

//   async getUserBets(userId: string): Promise<UserBet[]> {
//     return this.userBetRepository.find({
//       where: { user_id: userId },
//       order: { timestamp: 'DESC' },
//     });
//   }

//   async getRecentResults(
//     limit: number = 10,
//     duration?: string, // Add optional duration filter parameter
//   ): Promise<GameResult[]> {
//     // Validate the limit parameter
//     if (isNaN(limit) || limit <= 0 || limit > 100) {
//       throw new HttpException(
//         'Limit must be a number between 1 and 100',
//         HttpStatus.BAD_REQUEST,
//       );
//     }

//     try {
//       // Create base query builder
//       const queryBuilder = this.gameResultRepository
//         .createQueryBuilder('result')
//         .leftJoinAndSelect('result.game', 'game') // Include the related game
//         .select([
//           'result.id',
//           'result.period_id',
//           'result.number',
//           'result.color',
//           'result.size',
//           'result.timestamp',
//           'result.description',
//           'game.duration', // Include duration from the game relation
//           'game.period', // Include duration from the game relation
//         ])
//         .orderBy('result.timestamp', 'DESC')
//         .take(limit);

//       // Add duration filter if provided
//       if (duration) {
//         queryBuilder.where('game.duration = :duration', { duration });
//       }

//       const results = await queryBuilder.getMany();

//       return results || [];
//     } catch (error) {
//       console.error('Error fetching game results:', error);
//       throw new HttpException(
//         'Failed to retrieve game results',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   // Force-end all games (for testing or admin purposes)
//   async forceEndAllGames(): Promise<void> {
//     const activeGames = await this.colorGameRepository.find({
//       where: { active: true },
//     });

//     for (const game of activeGames) {
//       await this.endGame(game.id);
//     }
//   }
// }

import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ColorGame } from './entities/color-game.entity';
import { UserBet } from './entities/user-bet.entity';
import { GameResult } from './entities/game-result.entity';
import {
  PlaceBetDto,
  BetType,
  ColorValue,
  SizeValue,
} from './dto/place-bet.dto';
import { CreateGameDto, GameDuration } from './dto/create-game.dto';
import { CreateGameResultDto } from './dto/game-result.dto';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { format, addSeconds, addMinutes } from 'date-fns';
import { User } from 'src/users/entities/user.entity';

// Define interfaces for better type safety
export interface BettingAnalysis {
  numberBets: { [key: number]: number };
  colorBets: { [key: string]: number };
  sizeBets: { [key: string]: number };
  totalBetAmount: number;
  mostBetNumber: number;
  mostBetColor: string;
  mostBetSize: string;
}

export interface GameBettingStats {
  gameId: string;
  duration: string;
  period: string;
  endTime: Date;
  totalBets: number;
  analysis: BettingAnalysis;
}

export interface GameAnalysisResponse {
  gameId?: string;
  totalBets?: number;
  analysis?: BettingAnalysis;
  message?: string;
}

@Injectable()
export class ColorGameService implements OnModuleInit {
  private readonly logger = new Logger(ColorGameService.name);

  constructor(
    @InjectRepository(ColorGame)
    private colorGameRepository: Repository<ColorGame>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserBet)
    private userBetRepository: Repository<UserBet>,
    @InjectRepository(GameResult)
    private gameResultRepository: Repository<GameResult>,
    private connection: Connection,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  private globalManipulationEnabled: boolean = true;
  async onModuleInit() {
    // Start the games when the application starts
    await this.startAllGames();
  }

  async startAllGames() {
    // Clear any existing games
    await this.colorGameRepository
      .createQueryBuilder()
      .update(ColorGame)
      .set({ active: false })
      .execute();

    // Start each type of game
    // await this.createGame({ duration: GameDuration.THIRTY_SECONDS });
    // await this.createGame({ duration: GameDuration.ONE_MINUTE });
    // await this.createGame({ duration: GameDuration.THREE_MINUTES });
    // await this.createGame({ duration: GameDuration.FIVE_MINUTES });

    this.logger.log('All games started successfully');
  }

  generateUniqueDigitPeriod() {
    const getRandomDigit = () => Math.floor(Math.random() * 10);

    let randomFour = '';
    for (let i = 0; i < 4; i++) {
      randomFour += getRandomDigit();
    }

    const result = `0000000${randomFour}`;
    return result;
  }

  async createGame(createGameDto: CreateGameDto): Promise<ColorGame> {
    const id = uuidv4();
    const now = new Date();
    let endTime: Date;
    let periodFormat: string;

    switch (createGameDto.duration) {
      case GameDuration.THIRTY_SECONDS:
        endTime = addSeconds(now, 30);
        periodFormat = 'yyyyMMddHHmmss30s';
        break;
      case GameDuration.ONE_MINUTE:
        endTime = addMinutes(now, 1);
        periodFormat = 'yyyyMMddHHmm1m';
        break;
      case GameDuration.THREE_MINUTES:
        endTime = addMinutes(now, 3);
        periodFormat = 'yyyyMMddHHmm3m';
        break;
      case GameDuration.FIVE_MINUTES:
        endTime = addMinutes(now, 5);
        periodFormat = 'yyyyMMddHHmm5m';
        break;
    }

    const period = this.generateUniqueDigitPeriod();

    const game = this.colorGameRepository.create({
      id,
      period,
      duration: createGameDto.duration,
      end_time: endTime,
      active: true,
    });

    const savedGame = await this.colorGameRepository.save(game);

    // Schedule the end of the game
    const gameTimeout = setTimeout(
      () => this.endGame(id),
      endTime.getTime() - now.getTime(),
    );

    try {
      this.schedulerRegistry.addTimeout(`game-${id}`, gameTimeout);
    } catch (error) {
      this.logger.error(`Failed to schedule game end: ${error.message}`);
    }

    return savedGame;
  }

  async placeBet(placeBetDto: PlaceBetDto): Promise<UserBet> {
    // Find the active game for the period
    const game = await this.colorGameRepository.findOne({
      where: { id: placeBetDto.period_id, active: true },
    });

    if (!game) {
      throw new Error('Game not found or not active');
    }

    // Validate the bet
    this.validateBet(placeBetDto);

    // Calculate total amount
    const total_amount = placeBetDto.amount;

    // Get user to check wallet balance
    const user = await this.userRepository.findOne({
      where: { id: placeBetDto.user_id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has enough balance
    if (user.wallet < placeBetDto.amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Create the bet
    const bet = this.userBetRepository.create({
      id: uuidv4(),
      user_id: placeBetDto.user_id,
      period_id: placeBetDto.period_id,
      period: placeBetDto.period,
      bet_type: placeBetDto.bet_type,
      bet_value: placeBetDto.bet_value,
      amount: placeBetDto.amount,
      multiplier: placeBetDto.multiplier,
      total_amount,
    });

    // Update game stats and user wallet atomically
    await this.connection.transaction(async (manager) => {
      // Save the bet
      await manager.save(bet);

      // Update game total bets and amount
      await manager.increment(
        ColorGame,
        { id: placeBetDto.period_id },
        'total_bets',
        1,
      );

      await manager
        .createQueryBuilder()
        .update(ColorGame)
        .set({
          total_bet_amount: () => `total_bet_amount + ${placeBetDto.amount}`,
        })
        .where('id = :id', { id: placeBetDto.period_id })
        .execute();

      // Deduct the bet amount from user's wallet
      await manager
        .createQueryBuilder()
        .update(User)
        .set({
          wallet: () => `wallet - ${placeBetDto.amount}`,
        })
        .where('id = :id', { id: placeBetDto.user_id })
        .execute();
    });

    return bet;
  }

  private validateBet(placeBetDto: PlaceBetDto): void {
    const { bet_type, bet_value } = placeBetDto;

    switch (bet_type) {
      case BetType.COLOR:
        if (!Object.values(ColorValue).includes(bet_value as ColorValue)) {
          throw new Error(`Invalid color value: ${bet_value}`);
        }
        break;
      case BetType.NUMBER:
        const num = parseInt(bet_value);
        if (isNaN(num) || num < 0 || num > 9) {
          throw new Error(`Invalid number value: ${bet_value}`);
        }
        break;
      case BetType.SIZE:
        if (!Object.values(SizeValue).includes(bet_value as SizeValue)) {
          throw new Error(`Invalid size value: ${bet_value}`);
        }
        break;
      default:
        throw new Error(`Invalid bet type: ${bet_type}`);
    }
  }

  private analyzeBettingPatterns(bets: UserBet[]): BettingAnalysis {
    const numberBets: { [key: number]: number } = {};
    const colorBets: { [key: string]: number } = {};
    const sizeBets: { [key: string]: number } = {};
    let totalBetAmount = 0;

    // Initialize counters
    for (let i = 0; i <= 9; i++) {
      numberBets[i] = 0;
    }
    colorBets[ColorValue.RED] = 0;
    colorBets[ColorValue.GREEN] = 0;
    colorBets[ColorValue.BLACK] = 0;
    sizeBets[SizeValue.SMALL] = 0;
    sizeBets[SizeValue.BIG] = 0;

    // Count bets and amounts
    bets.forEach((bet) => {
      // Ensure bet.total_amount is a number
      const betAmount = parseFloat(bet.total_amount?.toString() || '0');
      totalBetAmount += betAmount;

      // Analyze by bet type
      if (bet.bet_type === 'number' && bet.bet_value !== undefined) {
        const number = parseInt(bet.bet_value.toString());
        if (number >= 0 && number <= 9) {
          numberBets[number] += betAmount;
        }
      } else if (bet.bet_type === 'color') {
        if (bet.bet_value === ColorValue.RED || bet.bet_value === 'red') {
          colorBets[ColorValue.RED] += betAmount;
        } else if (
          bet.bet_value === ColorValue.GREEN ||
          bet.bet_value === 'green'
        ) {
          colorBets[ColorValue.GREEN] += betAmount;
        } else if (
          bet.bet_value === ColorValue.BLACK ||
          bet.bet_value === 'black'
        ) {
          colorBets[ColorValue.BLACK] += betAmount;
        }
      } else if (bet.bet_type === 'size') {
        if (bet.bet_value === SizeValue.SMALL || bet.bet_value === 'small') {
          sizeBets[SizeValue.SMALL] += betAmount;
        } else if (bet.bet_value === SizeValue.BIG || bet.bet_value === 'big') {
          sizeBets[SizeValue.BIG] += betAmount;
        }
      }
    });

    // Find most bet categories
    const mostBetNumber = Object.entries(numberBets).reduce((a, b) =>
      a[1] > b[1] ? a : b,
    )[0];

    const mostBetColor = Object.entries(colorBets).reduce((a, b) =>
      a[1] > b[1] ? a : b,
    )[0];

    const mostBetSize = Object.entries(sizeBets).reduce((a, b) =>
      a[1] > b[1] ? a : b,
    )[0];

    // Round all amounts to 2 decimal places
    totalBetAmount = Math.round(totalBetAmount * 100) / 100;

    Object.keys(numberBets).forEach((key) => {
      numberBets[parseInt(key)] =
        Math.round(numberBets[parseInt(key)] * 100) / 100;
    });

    Object.keys(colorBets).forEach((key) => {
      colorBets[key] = Math.round(colorBets[key] * 100) / 100;
    });

    Object.keys(sizeBets).forEach((key) => {
      sizeBets[key] = Math.round(sizeBets[key] * 100) / 100;
    });

    return {
      numberBets,
      colorBets,
      sizeBets,
      totalBetAmount,
      mostBetNumber: parseInt(mostBetNumber),
      mostBetColor,
      mostBetSize,
    };
  }  

  // Add this property to your service class
  private manipulationEnabled: Map<string, boolean> = new Map();

  async endGame(gameId: string): Promise<void> {
    const game = await this.colorGameRepository.findOne({
      where: { id: gameId, active: true },
    });

    if (!game) {
      this.logger.warn(`Game ${gameId} not found or already ended`);
      return;
    }

    // Get all bets for analysis
    const bets = await this.userBetRepository.find({
      where: { period_id: gameId },
    });

    this.logger.log(`Processing ${bets.length} bets for game ${gameId}`);

    // Check if manipulation is enabled for this game
    const useManipulation = this.globalManipulationEnabled; // Default to true

    // Generate result based on manipulation setting
    const result = useManipulation
      ? await this.generateManipulatedResult(bets)
      : await this.generateRandomResult();

    this.logger.log(
      `Generated result (manipulation: ${useManipulation}): ${JSON.stringify(result)}`,
    );

    // Save result and process bets (rest of your existing code remains the same)
    const gameResult = this.gameResultRepository.create({
      period_id: gameId,
      number: result.number,
      color: result.color,
      size: result.size,
      description: `Game ${game.period} ended with number ${result.number}, color ${result.color}, size ${result.size}`,
      duration: game.duration,
    });

    await this.connection.transaction(async (manager) => {
      // Save the result
      await manager.save(gameResult);
      this.logger.log(`Game result saved for game ${gameId}`);

      // Process all bets for this game
      for (const bet of bets) {
        const isWin = this.checkWin(bet, result);
        this.logger.log(
          `Bet ${bet.id} - User: ${bet.user_id}, Amount: ${bet.total_amount}, Win: ${isWin}`,
        );

        let winAmount = 0;
        if (isWin) {
          const betAmount = parseFloat(bet.total_amount?.toString() || '0');
          const grossWinAmount = betAmount * 2;
          const fee = grossWinAmount * 0.1;
          winAmount = grossWinAmount - fee;

          this.logger.log(
            `Calculating win for bet ${bet.id}: betAmount=${betAmount}, grossWin=${grossWinAmount}, fee=${fee}, netWin=${winAmount}`,
          );

          const user = await manager.findOne(User, {
            where: { id: bet.user_id },
          });
          if (!user) {
            this.logger.error(
              `User ${bet.user_id} not found for bet ${bet.id}`,
            );
            continue;
          }

          const oldBalance = parseFloat(user.wallet?.toString() || '0');
          this.logger.log(`User ${bet.user_id} current balance: ${oldBalance}`);

          await manager
            .createQueryBuilder()
            .update(User)
            .set({
              wallet: () => `wallet + ${winAmount}`,
            })
            .where('id = :userId', { userId: bet.user_id })
            .execute();

          const updatedUser = await manager.findOne(User, {
            where: { id: bet.user_id },
          });
          const newBalance = parseFloat(updatedUser?.wallet?.toString() || '0');

          this.logger.log(
            `User ${bet.user_id} balance updated: ${oldBalance} -> ${newBalance} (+${winAmount})`,
          );
        }

        await manager.update(
          UserBet,
          { id: bet.id },
          {
            result: isWin ? 'win' : 'lose',
            win_amount: winAmount,
          },
        );

        this.logger.log(
          `Updated bet ${bet.id} with result: ${isWin ? 'win' : 'lose'}, win_amount: ${winAmount}`,
        );
      }

      await manager.update(ColorGame, { id: gameId }, { active: false });
      this.logger.log(`Game ${gameId} marked as inactive`);

      const newGame = await this.createGame({
        duration: game.duration as GameDuration,
      });
      this.logger.log(
        `Started new ${game.duration} game with ID: ${newGame.id}`,
      );

      // Copy manipulation setting to new game
      this.manipulationEnabled.set(newGame.id, useManipulation);
    });

    // Clean up manipulation setting for ended game
    this.manipulationEnabled.delete(gameId);

    try {
      this.schedulerRegistry.deleteTimeout(`game-${gameId}`);
      this.logger.log(`Cleaned up scheduler for game ${gameId}`);
    } catch (error) {
      this.logger.error(`Error removing game timeout: ${error.message}`);
    }
  }

  // Enhanced manipulation function - selects LOWEST bet amounts to win
  private async generateManipulatedResult(bets: UserBet[]): Promise<{
    number: number;
    color: ColorValue;
    size: SizeValue;
  }> {
    const analysis = this.analyzeBettingPatterns(bets);
    this.logger.log(
      'Betting Analysis for Manipulation:',
      JSON.stringify(analysis, null, 2),
    );

    // Select the number with LOWEST bet amount
    const lowestBetNumber = Object.entries(analysis.numberBets).sort(
      ([, a], [, b]) => (a as number) - (b as number),
    )[0];

    const selectedNumber = parseInt(lowestBetNumber[0]);

    // Select the color with LOWEST bet amount
    const lowestBetColor = Object.entries(analysis.colorBets).sort(
      ([, a], [, b]) => (a as number) - (b as number),
    )[0];

    let selectedColor: ColorValue;

    // For numbers 0 and 5, we can choose any color, so pick the lowest bet color
    if (selectedNumber === 0 || selectedNumber === 5) {
      selectedColor = lowestBetColor[0] as ColorValue;
    } else {
      // For other numbers, we need to respect game rules but try to minimize payouts
      const gameRuleColor =
        selectedNumber % 2 === 0 ? ColorValue.RED : ColorValue.GREEN;

      // If the game rule color has lower bets, use it; otherwise find alternative
      if (
        analysis.colorBets[gameRuleColor] <=
        Math.min(...Object.values(analysis.colorBets))
      ) {
        selectedColor = gameRuleColor;
      } else {
        // If game rule color has high bets, we might need to pick a different number
        // Find a number that allows us to use the lowest bet color
        const alternativeNumbers = Object.entries(analysis.numberBets)
          .filter(([num, amount]) => {
            const n = parseInt(num);
            const canUseLowestColor =
              n === 0 ||
              n === 5 ||
              (n % 2 === 0 && lowestBetColor[0] === ColorValue.RED) ||
              (n % 2 === 1 && lowestBetColor[0] === ColorValue.GREEN);
            return canUseLowestColor;
          })
          .sort(([, a], [, b]) => (a as number) - (b as number));

        if (alternativeNumbers.length > 0) {
          const altNumber = parseInt(alternativeNumbers[0][0]);
          selectedColor = lowestBetColor[0] as ColorValue;
          // Update selected number to match color choice
          if (altNumber !== selectedNumber) {
            this.logger.log(
              `Switching from number ${selectedNumber} to ${altNumber} to use lowest bet color`,
            );
          }
        } else {
          selectedColor = gameRuleColor; // Fallback to game rules
        }
      }
    }

    // Size is determined by the number (can't manipulate this due to game rules)
    const selectedSize = selectedNumber < 5 ? SizeValue.SMALL : SizeValue.BIG;

    this.logger.log(`Manipulation Result - LOWEST BETS WIN:
    - Selected number: ${selectedNumber} (bet amount: ${analysis.numberBets[selectedNumber]})
    - Selected color: ${selectedColor} (bet amount: ${analysis.colorBets[selectedColor]})
    - Selected size: ${selectedSize} (bet amount: ${analysis.sizeBets[selectedSize]})
    - Total potential payout minimized
  `);

    return {
      number: selectedNumber,
      color: selectedColor,
      size: selectedSize,
    };
  }

  // New function for random result generation
  private async generateRandomResult(): Promise<{
    number: number;
    color: ColorValue;
    size: SizeValue;
  }> {
    // Generate completely random number (0-9)
    const randomNumber = Math.floor(Math.random() * 10);

    let randomColor: ColorValue;

    // For numbers 0 and 5, randomly choose between red and green
    if (randomNumber === 0 || randomNumber === 5) {
      randomColor = Math.random() < 0.5 ? ColorValue.RED : ColorValue.GREEN;
    } else {
      // Follow normal game rules for other numbers
      randomColor = randomNumber % 2 === 0 ? ColorValue.RED : ColorValue.GREEN;

      // Occasionally break the rules for true randomness (10% chance)
      if (Math.random() < 0.1) {
        const colors = [ColorValue.RED, ColorValue.GREEN, ColorValue.BLACK];
        randomColor = colors[Math.floor(Math.random() * colors.length)];
      }
    }

    // Size follows game rules
    const randomSize = randomNumber < 5 ? SizeValue.SMALL : SizeValue.BIG;

    this.logger.log(`Random Result Generated:
    - Number: ${randomNumber}
    - Color: ${randomColor}
    - Size: ${randomSize}
  `);

    return {
      number: randomNumber,
      color: randomColor,
      size: randomSize,
    };
  }

  // Enhanced toggle function with better control
  async toggleManipulation(
    gameId: string,
    useManipulation: boolean = true,
  ): Promise<{
    message: string;
    gameId: string;
    manipulationEnabled: boolean;
    previousSetting?: boolean;
  }> {
    const previousSetting = this.manipulationEnabled.get(gameId);

    // Set manipulation setting for the game
    this.manipulationEnabled.set(gameId, useManipulation);

    this.logger.log(
      `Manipulation ${useManipulation ? 'ENABLED' : 'DISABLED'} for game ${gameId}`,
    );

    return {
      message: `Game ${gameId}: Manipulation ${useManipulation ? 'ENABLED - Lowest bets will win' : 'DISABLED - Random results'}`,
      gameId,
      manipulationEnabled: useManipulation,
      previousSetting,
    };
  }

  // Helper function to check current manipulation status
  getManipulationStatus(gameId: string): boolean {
    return this.manipulationEnabled.get(gameId) ?? true; // Default to true
  }

  // Helper function to set global manipulation (for all new games)
  setGlobalManipulation(enabled: boolean): void {
    this.globalManipulationEnabled = enabled;
    this.logger.log(`Global manipulation ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  private checkWin(
    bet: UserBet,
    result: { number: number; color: string; size: string },
  ): boolean {
    switch (bet.bet_type) {
      case BetType.COLOR:
        return bet.bet_value === result.color;
      case BetType.NUMBER:
        return parseInt(bet.bet_value) === result.number;
      case BetType.SIZE:
        return bet.bet_value === result.size;
      default:
        return false;
    }
  }

  async getActiveGames(): Promise<ColorGame[]> {
    return this.colorGameRepository.find({
      where: { active: true },
      order: { end_time: 'ASC' },
    });
  }

  async getGameById(id: string): Promise<ColorGame | null> {
    return this.colorGameRepository.findOne({
      where: { id },
      relations: ['game_results'],
    });
  }

  async getGameByDuration(duration: string): Promise<ColorGame | null> {
    return this.colorGameRepository.findOne({
      where: { duration },
      relations: ['game_results'],
    });
  }

  async getGameBets(gameId: string): Promise<UserBet[]> {
    return this.userBetRepository.find({
      where: { period_id: gameId },
      order: { timestamp: 'DESC' },
    });
  }

  async getUserBets(userId: string): Promise<UserBet[]> {
    return this.userBetRepository.find({
      where: { user_id: userId },
      order: { timestamp: 'DESC' },
    });
  }

  async getRecentResults(
    limit: number = 10,
    duration?: string,
  ): Promise<GameResult[]> {
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      throw new HttpException(
        'Limit must be a number between 1 and 100',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const queryBuilder = this.gameResultRepository
        .createQueryBuilder('result')
        .leftJoinAndSelect('result.game', 'game')
        .select([
          'result.id',
          'result.period_id',
          'result.number',
          'result.color',
          'result.size',
          'result.timestamp',
          'result.description',
          'game.duration',
          'game.period',
        ])
        .orderBy('result.timestamp', 'DESC')
        .take(limit);

      if (duration) {
        queryBuilder.where('game.duration = :duration', { duration });
      }

      const results = await queryBuilder.getMany();
      return results || [];
    } catch (error) {
      console.error('Error fetching game results:', error);
      throw new HttpException(
        'Failed to retrieve game results',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // New method to get betting analysis for a specific game
  async getGameBettingAnalysis(gameId: string): Promise<GameAnalysisResponse> {
    const bets = await this.userBetRepository.find({
      where: { period_id: gameId },
    });

    if (bets.length === 0) {
      return {
        message: 'No bets found for this game',
        analysis: undefined,
      };
    }

    const analysis = this.analyzeBettingPatterns(bets);
    return {
      gameId,
      totalBets: bets.length,
      analysis,
    };
  }

  // Method to get betting statistics across all active games
  async getAllActiveGamesBettingStats(): Promise<GameBettingStats[]> {
    const activeGames = await this.getActiveGames();
    const stats: GameBettingStats[] = []; // Explicitly type the array

    for (const game of activeGames) {
      const bets = await this.userBetRepository.find({
        where: { period_id: game.id },
      });

      if (bets.length > 0) {
        const analysis = this.analyzeBettingPatterns(bets);
        stats.push({
          gameId: game.id,
          duration: game.duration,
          period: game.period,
          endTime: game.end_time,
          totalBets: bets.length,
          analysis,
        });
      }
    }

    return stats;
  }

  // Method to get historical betting patterns for a specific duration
  async getHistoricalBettingPatterns(
    duration: string,
    limit: number = 20,
  ): Promise<{
    duration: string;
    totalGamesAnalyzed: number;
    averageWinRate: number;
    commonWinningNumbers: number[];
    commonWinningColors: string[];
    totalBetsAnalyzed: number;
  }> {
    const results = await this.getRecentResults(limit, duration);

    if (results.length === 0) {
      throw new HttpException(
        `No historical data found for duration: ${duration}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const numberFrequency: { [key: number]: number } = {};
    const colorFrequency: { [key: string]: number } = {};
    let totalWins = 0;
    let totalBets = 0;

    // Initialize counters
    for (let i = 0; i <= 9; i++) {
      numberFrequency[i] = 0;
    }
    colorFrequency[ColorValue.RED] = 0;
    colorFrequency[ColorValue.GREEN] = 0;
    colorFrequency[ColorValue.BLACK] = 0;

    // Analyze historical results
    for (const result of results) {
      numberFrequency[result.number]++;
      colorFrequency[result.color]++;

      // Get bets for this game to calculate win rate
      const gameBets = await this.userBetRepository.find({
        where: { period_id: result.period_id },
      });

      totalBets += gameBets.length;
      totalWins += gameBets.filter((bet) => bet.result === 'win').length;
    }

    // Find most common winning numbers and colors
    const commonWinningNumbers = Object.entries(numberFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([num]) => parseInt(num));

    const commonWinningColors = Object.entries(colorFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([color]) => color);

    const averageWinRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;

    return {
      duration,
      totalGamesAnalyzed: results.length,
      averageWinRate: Math.round(averageWinRate * 100) / 100,
      commonWinningNumbers,
      commonWinningColors,
      totalBetsAnalyzed: totalBets,
    };
  }

  // Method to toggle between random and manipulated results (for testing)

  // Force-end all games (for testing or admin purposes)
  async forceEndAllGames(): Promise<void> {
    const activeGames = await this.colorGameRepository.find({
      where: { active: true },
    });

    for (const game of activeGames) {
      await this.endGame(game.id);
    }
  }
}
