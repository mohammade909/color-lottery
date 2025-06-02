import {
  Injectable,
  Logger,
  OnModuleInit,
  Inject,
  forwardRef,
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
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { format, addSeconds, addMinutes } from 'date-fns';
import { ModuleRef } from '@nestjs/core';
import { GameGateway } from './game.gateway';
import {
  GameFilterOptionsDto,
  GameStatisticsDto,
  BetStatisticsDto,
  DurationStatisticsDto,
  ActivityStatDto,
} from './dto/game-statistics.dto';
import { Transaction } from 'src/users/entities/transaction.entity';
import { User } from 'src/users/entities/user.entity';

type GameFilterOptions = GameFilterOptionsDto;
type GameStatistics = GameStatisticsDto;

@Injectable()
export class GameService implements OnModuleInit {
  private readonly logger = new Logger(GameService.name);
  private readonly multipliers = {
    color: {
      red: 2,
      green: 14,
      black: 2,
    },
    number: {
      '0': 9,
      '1': 9,
      '2': 9,
      '3': 9,
      '4': 9,
      '5': 9,
      '6': 9,
      '7': 9,
      '8': 9,
      '9': 9,
    },
    size: {
      big: 2,
      small: 2,
    },
  };

  constructor(
    @InjectRepository(ColorGame)
    private colorGameRepository: Repository<ColorGame>,
    @InjectRepository(UserBet)
    private userBetRepository: Repository<UserBet>,
    @InjectRepository(GameResult)
    private gameResultRepository: Repository<GameResult>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private connection: Connection,
    private schedulerRegistry: SchedulerRegistry,
    private moduleRef: ModuleRef,
    @Inject(forwardRef(() => GameGateway)) // Add this line
    private colorGameGateway: GameGateway, // Change from private local property to injected
  ) {}

  async onModuleInit() {
    // Get the gateway through the module reference system to avoid circular dependency
    try {
      this.colorGameGateway = await this.moduleRef.get(GameGateway, {
        strict: false,
      });
    } catch (error) {
      this.logger.warn(
        'ColorGameGateway not available yet, will be resolved later',
      );
    }

    // Start the games when the application starts
    await this.startAllGames();
  }

  // Resolve the gateway if it wasn't available during module initialization
  private async resolveGateway() {
    if (!this.colorGameGateway) {
      try {
        this.colorGameGateway = await this.moduleRef.get(GameGateway, {
          strict: false,
        });
      } catch (error) {
        this.logger.warn('ColorGameGateway still not available');
      }
    }
  }

  async startAllGames() {
    // Clear any existing games
    await this.colorGameRepository
      .createQueryBuilder()
      .update(ColorGame)
      .set({ active: false })
      .execute();

    // Start each type of game
    await this.createGame({ duration: GameDuration.THIRTY_SECONDS });
    await this.createGame({ duration: GameDuration.ONE_MINUTE });
    await this.createGame({ duration: GameDuration.THREE_MINUTES });
    await this.createGame({ duration: GameDuration.FIVE_MINUTES });

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

    // Notify through WebSocket
    await this.resolveGateway();
    if (this.colorGameGateway?.server) {
      this.colorGameGateway.server.emit('newGame', savedGame);
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

    // Check if the game is still open for betting
    const now = new Date();
    const endTime = new Date(game.end_time);
    if (now >= endTime) {
      throw new Error('Game has ended or is about to end. Cannot place bet.');
    }

    // Validate the bet
    this.validateBet(placeBetDto);

    const multiplier = this.getMultiplier(
      placeBetDto.bet_type,
      placeBetDto.bet_value,
    );
    const total_amount = placeBetDto.amount * multiplier;

    // Create the bet
    const bet = this.userBetRepository.create({
      id: uuidv4(),
      user_id: placeBetDto.user_id,
      period_id: placeBetDto.period_id,
      bet_type: placeBetDto.bet_type,
      bet_value: placeBetDto.bet_value,
      amount: placeBetDto.amount,
      multiplier,
      total_amount,
    });

    // Update game stats atomically
    await this.connection.transaction(async (manager) => {
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

  private getMultiplier(betType: string, betValue: string): number {
    return this.multipliers[betType][betValue];
  }

  // async endGame(gameId: string): Promise<void> {
  //   const game = await this.colorGameRepository.findOne({
  //     where: { id: gameId, active: true },
  //   });

  //   if (!game) {
  //     this.logger.warn(`Game ${gameId} not found or already ended`);
  //     return;
  //   }

  //   // Generate random result
  //   const result = this.generateGameResult();

  //   // Save result
  //   const gameResult = this.gameResultRepository.create({
  //     period_id: gameId,
  //     number: result.number,
  //     color: result.color,
  //     size: result.size,
  //     description: `Game ${game.period} ended with number ${result.number}, color ${result.color}, size ${result.size}`,
  //   });

  //   // Initialize these variables as undefined
  //   let savedResult: GameResult | undefined;
  //   let newGame: ColorGame | undefined;

  //   await this.connection.transaction(async (manager) => {
  //     // Save the result
  //     savedResult = await manager.save(gameResult);

  //     // Process all bets for this game
  //     const bets = await this.userBetRepository.find({
  //       where: { period_id: gameId },
  //     });

  //     for (const bet of bets) {
  //       const isWin = this.checkWin(bet, result);
  //       const winAmount = isWin ? bet.total_amount : 0;

  //       await manager.update(
  //         UserBet,
  //         { id: bet.id },
  //         {
  //           result: isWin ? 'win' : 'lose',
  //           win_amount: winAmount,
  //         },
  //       );

  //       // Here you would also update the user's balance
  //       // This depends on your user/wallet implementation
  //     }

  //     // Mark game as inactive
  //     await manager.update(ColorGame, { id: gameId }, { active: false });

  //     // Start a new game of the same duration
  //     newGame = await this.createGame({
  //       duration: game.duration as GameDuration,
  //     });
  //     this.logger.log(
  //       `Started new ${game.duration} game with ID: ${newGame.id}`,
  //     );
  //   });

  //   // Notify through WebSocket
  //   await this.resolveGateway();

  //   if (this.colorGameGateway && savedResult && newGame) {
  //     // Send result with completed game data and processed bets
  //     const fullGameData = {
  //       ...game,
  //       result: savedResult,
  //       newGameId: newGame.id,
  //     };

  //     // Emit the result through the gateway
  //     await this.colorGameGateway.emitGameResult(gameId, fullGameData);
  //   }

  //   // Clean up scheduler
  //   try {
  //     this.schedulerRegistry.deleteTimeout(`game-${gameId}`);
  //   } catch (error) {
  //     this.logger.error(`Error removing game timeout: ${error.message}`);
  //   }
  // }

  // private generateGameResult(): {
  //   number: number;
  //   color: ColorValue;
  //   size: SizeValue;
  // } {
  //   const number = Math.floor(Math.random() * 10); // 0-9

  //   // Determine color based on number
  //   let color: ColorValue;
  //   if (number === 0) {
  //     color = ColorValue.GREEN;
  //   } else if (number % 2 === 0) {
  //     color = ColorValue.RED;
  //   } else {
  //     color = ColorValue.BLACK;
  //   }

  //   // Determine size
  //   const size = number > 4 ? SizeValue.BIG : SizeValue.SMALL;

  //   return { number, color, size };
  // }

  // private checkWin(
  //   bet: UserBet,
  //   result: { number: number; color: string; size: string },
  // ): boolean {
  //   switch (bet.bet_type) {
  //     case BetType.COLOR:
  //       return bet.bet_value === result.color;
  //     case BetType.NUMBER:
  //       return parseInt(bet.bet_value) === result.number;
  //     case BetType.SIZE:
  //       return bet.bet_value === result.size;
  //     default:
  //       return false;
  //   }
  // }

  async endGame(gameId: string): Promise<void> {
    const game = await this.colorGameRepository.findOne({
      where: { id: gameId, active: true },
    });

    if (!game) {
      this.logger.warn(`Game ${gameId} not found or already ended`);
      return;
    }

    // Calculate total bets and generate strategic result
    const result = await this.generateStrategicResult(gameId);

    // Save result
    const gameResult = this.gameResultRepository.create({
      period_id: gameId,
      number: result.number,
      color: result.color,
      size: result.size,
      description: `Game ${game.period} ended with number ${result.number}, color ${result.color}, size ${result.size}`,
      duration: game.duration,
    });

    let savedResult: GameResult | undefined;
    let newGame: ColorGame | undefined;

    await this.connection.transaction(async (manager) => {
      // Save the result
      savedResult = await manager.save(gameResult);

      // Process all bets for this game
      const bets = await this.userBetRepository.find({
        where: { period_id: gameId },
      });

      for (const bet of bets) {
        const isWin = this.checkWin(bet, result);

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
      }

      // Mark game as inactive
      await manager.update(ColorGame, { id: gameId }, { active: false });

      // Start a new game of the same duration
      newGame = await this.createGame({
        duration: game.duration as GameDuration,
      });
      this.logger.log(
        `Started new ${game.duration} game with ID: ${newGame.id}`,
      );
    });

    // Notify through WebSocket
    await this.resolveGateway();

    if (this.colorGameGateway && savedResult && newGame) {
      const fullGameData = {
        ...game,
        result: savedResult,
        newGameId: newGame.id,
      };

      await this.colorGameGateway.emitGameResult(gameId, fullGameData);
    }

    // Clean up scheduler
    try {
      this.schedulerRegistry.deleteTimeout(`game-${gameId}`);
    } catch (error) {
      this.logger.error(`Error removing game timeout: ${error.message}`);
    }
  }

  private async generateStrategicResult(gameId: string): Promise<{
    number: number;
    color: ColorValue;
    size: SizeValue;
  }> {
    // Get all bets for this game
    const bets = await this.userBetRepository.find({
      where: { period_id: gameId },
    });

    // Calculate total amounts for each bet type
    const betAnalysis = this.analyzeBets(bets);

    // Find the option with minimum total bet amount for each category
    const winningColor = this.findMinBetOption(betAnalysis.colorBets);
    const winningSize = this.findMinBetOption(betAnalysis.sizeBets);
    const winningNumber = this.findMinBetOption(betAnalysis.numberBets);

    // Generate a number that matches our strategic requirements
    const strategicNumber = this.generateStrategicNumber(
      winningColor,
      winningSize,
      winningNumber,
    );

    // Get color and size based on the strategic number
    const color = this.getColorForNumber(strategicNumber);
    const size = strategicNumber > 4 ? SizeValue.BIG : SizeValue.SMALL;

    this.logger.log(
      `Strategic result for game ${gameId}: Number=${strategicNumber}, Color=${color}, Size=${size}`,
    );
    this.logger.log(`Bet analysis: ${JSON.stringify(betAnalysis)}`);

    return {
      number: strategicNumber,
      color,
      size,
    };
  }

  private analyzeBets(bets: UserBet[]): {
    colorBets: Record<string, number>;
    sizeBets: Record<string, number>;
    numberBets: Record<string, number>;
  } {
    const colorBets: Record<string, number> = {
      [ColorValue.RED]: 0,
      [ColorValue.GREEN]: 0,
      [ColorValue.BLACK]: 0,
    };

    const sizeBets: Record<string, number> = {
      [SizeValue.BIG]: 0,
      [SizeValue.SMALL]: 0,
    };

    const numberBets: Record<string, number> = {};

    // Initialize number bets
    for (let i = 0; i <= 9; i++) {
      numberBets[i.toString()] = 0;
    }

    // Calculate total bet amounts for each category
    bets.forEach((bet) => {
      switch (bet.bet_type) {
        case BetType.COLOR:
          colorBets[bet.bet_value] =
            (colorBets[bet.bet_value] || 0) + bet.total_amount;
          break;
        case BetType.SIZE:
          sizeBets[bet.bet_value] =
            (sizeBets[bet.bet_value] || 0) + bet.total_amount;
          break;
        case BetType.NUMBER:
          numberBets[bet.bet_value] =
            (numberBets[bet.bet_value] || 0) + bet.total_amount;
          break;
      }
    });

    return { colorBets, sizeBets, numberBets };
  }

  private findMinBetOption(betAmounts: Record<string, number>): string {
    let minAmount = Infinity;
    let minOption = '';

    Object.entries(betAmounts).forEach(([option, amount]) => {
      if (amount < minAmount) {
        minAmount = amount;
        minOption = option;
      }
    });

    return minOption;
  }

  private generateStrategicNumber(
    targetColor: string,
    targetSize: string,
    targetNumber: string,
  ): number {
    // Priority 1: If a specific number has minimum bets, use it
    const numberValue = parseInt(targetNumber);
    if (!isNaN(numberValue) && numberValue >= 0 && numberValue <= 9) {
      const numberColor = this.getColorForNumber(numberValue);
      const numberSize = numberValue > 4 ? SizeValue.BIG : SizeValue.SMALL;

      // Check if this number also satisfies color and size requirements
      if (numberColor === targetColor && numberSize === targetSize) {
        return numberValue;
      }
    }

    // Priority 2: Find a number that matches both color and size preferences
    const possibleNumbers = this.getNumbersForColorAndSize(
      targetColor,
      targetSize,
    );

    if (possibleNumbers.length > 0) {
      // Return the first number that matches both color and size
      return possibleNumbers[0];
    }

    // Priority 3: Prefer color over size if no perfect match
    const numbersForColor = this.getNumbersForColor(targetColor);
    if (numbersForColor.length > 0) {
      return numbersForColor[0];
    }

    // Priority 4: Use size preference
    const numbersForSize = this.getNumbersForSize(targetSize);
    if (numbersForSize.length > 0) {
      return numbersForSize[0];
    }

    // Fallback: random number (should rarely happen)
    return Math.floor(Math.random() * 10);
  }

  private getNumbersForColorAndSize(color: string, size: string): number[] {
    const numbers: number[] = [];

    for (let i = 0; i <= 9; i++) {
      const numberColor = this.getColorForNumber(i);
      const numberSize = i > 4 ? SizeValue.BIG : SizeValue.SMALL;

      if (numberColor === color && numberSize === size) {
        numbers.push(i);
      }
    }

    return numbers;
  }

  private getNumbersForColor(color: string): number[] {
    const numbers: number[] = [];

    for (let i = 0; i <= 9; i++) {
      if (this.getColorForNumber(i) === color) {
        numbers.push(i);
      }
    }

    return numbers;
  }

  private getNumbersForSize(size: string): number[] {
    const numbers: number[] = [];

    for (let i = 0; i <= 9; i++) {
      const numberSize = i > 4 ? SizeValue.BIG : SizeValue.SMALL;
      if (numberSize === size) {
        numbers.push(i);
      }
    }

    return numbers;
  }

  private getColorForNumber(number: number): ColorValue {
    if (number === 0 || number === 5) {
      // For 0 and 5, you might want to implement additional logic
      // to choose between red and green based on bet amounts
      return Math.random() < 0.5 ? ColorValue.RED : ColorValue.GREEN;
    } else if (number % 2 === 0) {
      // Even numbers (2, 4, 6, 8) are red
      return ColorValue.RED;
    } else {
      // Odd numbers (1, 3, 7, 9) are green
      return ColorValue.GREEN;
    }
  }

  // Enhanced method to handle 0 and 5 strategically
  private getStrategicColorForSpecialNumber(
    number: number,
    targetColor: string,
  ): ColorValue {
    if (number === 0 || number === 5) {
      // Return the color that has minimum bets
      return targetColor as ColorValue;
    }

    return this.getColorForNumber(number);
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

  // Additional utility method to get comprehensive game statistics

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
      where: { duration, active: true },
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
    const queryBuilder = this.gameResultRepository
      .createQueryBuilder('gameResult')
      .leftJoinAndSelect('gameResult.game', 'game')
      .orderBy('gameResult.timestamp', 'DESC')
      .take(limit);

    // Filter by game duration if provided
    if (duration !== undefined && duration !== null && duration.trim() !== '') {
      queryBuilder.where('game.duration = :duration', {
        duration: duration.trim(),
      });
    }

    return queryBuilder.getMany();
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.find();
  }

  // Force-end all games (for testing or admin purposes)
  async forceEndAllGames(): Promise<void> {
    const activeGames = await this.colorGameRepository.find({
      where: { active: true },
    });

    for (const game of activeGames) {
      await this.endGame(game.id);
    }
  }

  async getAllGamesForAdmin(options: GameFilterOptions): Promise<ColorGame[]> {
    const queryBuilder = this.colorGameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.game_results', 'results');

    if (options.active !== undefined) {
      queryBuilder.andWhere('game.active = :active', {
        active: options.active,
      });
    }

    if (options.duration) {
      queryBuilder.andWhere('game.duration = :duration', {
        duration: options.duration,
      });
    }

    queryBuilder.orderBy('game.end_time', 'DESC').take(options.limit || 50);

    return queryBuilder.getMany();
  }

  async getGameStatistics(days: number = 7): Promise<GameStatistics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get basic game counts
    const [totalGames, activeGames] = await Promise.all([
      this.colorGameRepository.count(),
      this.colorGameRepository.count({ where: { active: true } }),
    ]);

    const completedGames = totalGames - activeGames;

    // Get bet statistics
    const betStats = await this.userBetRepository
      .createQueryBuilder('bet')
      .select([
        'COUNT(*) as totalBets',
        'SUM(bet.amount) as totalBetAmount',
        'SUM(bet.win_amount) as totalWinAmount',
      ])
      .getRawOne();

    // Get bet type statistics
    const betTypeStats = await this.userBetRepository
      .createQueryBuilder('bet')
      .select(['bet.bet_type as type', 'COUNT(*) as count'])
      .groupBy('bet.bet_type')
      .getRawMany();

    const totalBetsForPercentage = parseInt(betStats.totalBets) || 1;
    const popularBetTypes = betTypeStats.map((stat) => ({
      type: stat.type,
      count: parseInt(stat.count),
      percentage:
        ((parseInt(stat.count) / totalBetsForPercentage) * 100).toFixed(2) +
        '%',
    }));

    // Get win rate by bet type
    const winRateStats = await this.userBetRepository
      .createQueryBuilder('bet')
      .select([
        'bet.bet_type as type',
        'COUNT(*) as totalBets',
        "SUM(CASE WHEN bet.result = 'win' THEN 1 ELSE 0 END) as wins",
      ])
      .groupBy('bet.bet_type')
      .getRawMany();

    const winRateByBetType = winRateStats.map((stat) => ({
      type: stat.type,
      totalBets: parseInt(stat.totalBets),
      winRate:
        ((parseInt(stat.wins) / parseInt(stat.totalBets)) * 100).toFixed(2) +
        '%',
    }));

    // Get games by duration
    const durationStats = await this.colorGameRepository
      .createQueryBuilder('game')
      .select(['game.duration as duration', 'COUNT(*) as count'])
      .groupBy('game.duration')
      .getRawMany();

    const gamesByDuration = durationStats.map((stat) => ({
      duration: stat.duration,
      count: parseInt(stat.count),
      percentage: ((parseInt(stat.count) / totalGames) * 100).toFixed(2) + '%',
    }));

    // Get recent activity (last 24 hours and 7 days)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const [recent24h, recent7d] = await Promise.all([
      this.getActivityStats(last24Hours),
      this.getActivityStats(startDate),
    ]);

    const totalBetAmount = parseFloat(betStats.totalBetAmount) || 0;
    const totalWinAmount = parseFloat(betStats.totalWinAmount) || 0;

    return {
      totalGames,
      activeGames,
      completedGames,
      totalBets: parseInt(betStats.totalBets) || 0,
      totalBetAmount,
      totalWinAmount,
      totalProfitLoss: totalBetAmount - totalWinAmount,
      averageBetsPerGame:
        completedGames > 0
          ? parseFloat(
              (parseInt(betStats.totalBets) / completedGames).toFixed(2),
            )
          : 0,
      popularBetTypes,
      winRateByBetType,
      gamesByDuration,
      recentActivity: {
        last24Hours: recent24h,
        last7Days: recent7d,
      },
    };
  }

  private async getActivityStats(fromDate: Date): Promise<ActivityStatDto> {
    const [gameCount, betStats] = await Promise.all([
      this.colorGameRepository
        .createQueryBuilder('game')
        .where('game.end_time >= :fromDate', { fromDate })
        .getCount(),
      this.userBetRepository
        .createQueryBuilder('bet')
        .select(['COUNT(*) as bets', 'SUM(bet.amount) as betAmount'])
        .where('bet.timestamp >= :fromDate', { fromDate })
        .getRawOne(),
    ]);

    return {
      games: gameCount,
      bets: parseInt(betStats.bets) || 0,
      betAmount: parseFloat(betStats.betAmount) || 0,
    };
  }

  async getStatisticsByDuration(
    duration: string,
  ): Promise<DurationStatisticsDto> {
    const games = await this.colorGameRepository.find({
      where: { duration },
    });

    if (games.length === 0) {
      return {
        duration,
        totalGames: 0,
        activeGames: 0,
        completedGames: 0,
        statistics: null,
      };
    }

    const gameIds = games.map((game) => game.id);
    const activeGames = games.filter((game) => game.active).length;

    // Get bet statistics for this duration
    const betStats = await this.userBetRepository
      .createQueryBuilder('bet')
      .select([
        'COUNT(*) as totalBets',
        'SUM(bet.amount) as totalBetAmount',
        'SUM(bet.win_amount) as totalWinAmount',
        "SUM(CASE WHEN bet.result = 'win' THEN 1 ELSE 0 END) as winningBets",
      ])
      .where('bet.period_id IN (:...gameIds)', { gameIds })
      .getRawOne();

    const totalBets = parseInt(betStats.totalBets) || 0;
    const totalBetAmount = parseFloat(betStats.totalBetAmount) || 0;
    const totalWinAmount = parseFloat(betStats.totalWinAmount) || 0;
    const winningBets = parseInt(betStats.winningBets) || 0;

    return {
      duration,
      totalGames: games.length,
      activeGames,
      completedGames: games.length - activeGames,
      statistics: {
        totalBets,
        totalBetAmount,
        totalWinAmount,
        winningBets,
        losingBets: totalBets - winningBets,
        winRate:
          totalBets > 0
            ? `${((winningBets / totalBets) * 100).toFixed(2)}%`
            : '0%',
        profitLoss: totalBetAmount - totalWinAmount,
        averageBetPerGame:
          games.length > 0 ? (totalBetAmount / games.length).toFixed(2) : '0',
      },
    };
  }
}
