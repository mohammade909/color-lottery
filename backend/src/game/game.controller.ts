import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import {
  GameStatisticsResponseDto,
  BetStatisticsResponseDto,
  UserStatisticsResponseDto,
  DurationStatisticsDto,
  StandardResponseDto,
} from './dto/game-statistics.dto';
import { Transaction } from 'src/users/entities/transaction.entity';
import { UserBet } from './entities/user-bet.entity';

@ApiTags('websocket')
@Controller('websocket')
export class WebSocketController {
  constructor(
    private readonly colorGameGateway: GameGateway,
    private readonly gameService: GameService, // Make this readonly and properly inject
  ) {}

  @Get('check-status')
  @ApiOperation({ summary: 'Get WebSocket server status' })
  @ApiResponse({ status: 200, description: 'Return WebSocket server status' })
  getStatus() {
    return {
      status: 'active',
      connections: this.colorGameGateway.server?.sockets?.sockets?.size || 0,
      serverTime: new Date().toISOString(),
    };
  }
  @Get('active/games')
  @ApiOperation({ summary: 'Get WebSocket server status' })
  @ApiResponse({ status: 200, description: 'Return WebSocket server status' })
  async getGames() {
    try {
      const games = await this.gameService.getActiveGames();
      return games;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }

  @Get('admin/games')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all games for admin (active and inactive)' })
  @ApiResponse({
    status: 200,
    description: 'Return all games with details',
    type: StandardResponseDto,
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    type: String,
    description: 'Filter by game duration',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit number of results',
  })
  async getAllGames(
    @Query('active') active?: boolean,
    @Query('duration') duration?: string,
    @Query('limit') limit?: number,
  ): Promise<StandardResponseDto<any[]>> {
    try {
      const games = await this.gameService.getAllGamesForAdmin({
        active,
        duration,
        limit: limit || 50,
      });

      return {
        success: true,
        data: games,
        total: games.length,
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }

  @Get('admin/games/active')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all active games' })
  @ApiResponse({
    status: 200,
    description: 'Return all active games',
    type: StandardResponseDto,
  })
  async getActiveGames(): Promise<StandardResponseDto<any[]>> {
    try {
      const games = await this.gameService.getActiveGames();
      return {
        success: true,
        data: games,
        total: games.length,
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }

  @Get('admin/games/:gameId')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get game details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return game details',
    type: StandardResponseDto,
  })
  async getGameById(
    @Param('gameId') gameId: string,
  ): Promise<StandardResponseDto<any>> {
    try {
      const game = await this.gameService.getGameById(gameId);

      if (!game) {
        return {
          success: false,
          message: 'Game not found',
          serverTime: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: game,
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }

  @Get('/game/:duration')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get game details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return game details',
    type: StandardResponseDto,
  })
  async getGameByDuration(
    @Param('duration') duration: string,
  ): Promise<StandardResponseDto<any>> {
    try {
      const game = await this.gameService.getGameByDuration(duration);

      if (!game) {
        return {
          success: false,
          message: 'Game not found',
          serverTime: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: game,
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }

  @Get('admin/games/:gameId/bets')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all bets for a specific game' })
  @ApiResponse({
    status: 200,
    description: 'Return game bets',
    type: BetStatisticsResponseDto,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit number of results',
  })
  async getGameBets(
    @Param('gameId') gameId: string,
    @Query('limit') limit?: number,
  ): Promise<BetStatisticsResponseDto> {
    try {
      const bets = await this.gameService.getGameBets(gameId);
      const limitedBets = limit ? bets.slice(0, limit) : bets;

      // Calculate betting statistics
      const totalBets = bets.length;
      const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
      const totalWinAmount = bets.reduce(
        (sum, bet) => sum + (bet.win_amount || 0),
        0,
      );
      const winningBets = bets.filter((bet) => bet.result === 'win').length;
      const winRate =
        totalBets > 0 ? ((winningBets / totalBets) * 100).toFixed(2) : '0';

      return {
        success: true,
        data: {
          bets: limitedBets,
          statistics: {
            totalBets,
            totalBetAmount,
            totalWinAmount,
            winningBets,
            losingBets: totalBets - winningBets,
            winRate: `${winRate}%`,
            profitLoss: totalBetAmount - totalWinAmount,
          },
        },
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }

  @Get('admin/statistics')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get overall game statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return comprehensive game statistics',
    type: GameStatisticsResponseDto,
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to include in statistics',
  })
  async getGameStatistics(
    @Query('days') days?: number,
  ): Promise<GameStatisticsResponseDto> {
    try {
      const statistics = await this.gameService.getGameStatistics(days || 7);

      return {
        success: true,
        data: statistics,
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }

  @Get('admin/statistics/duration/:duration')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get statistics for specific game duration' })
  @ApiResponse({
    status: 200,
    description: 'Return statistics for specific duration',
    type: StandardResponseDto,
  })
  async getStatisticsByDuration(
    @Param('duration') duration: string,
  ): Promise<StandardResponseDto<DurationStatisticsDto>> {
    try {
      const statistics =
        await this.gameService.getStatisticsByDuration(duration);

      return {
        success: true,
        data: statistics,
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }

  @Get('admin/users/:userId/bets')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all bets for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'Return user bets',
    type: UserStatisticsResponseDto,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit number of results',
  })
  async getSingleUserBets(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ): Promise<UserStatisticsResponseDto> {
    try {
      const bets = await this.gameService.getUserBets(userId);
      const limitedBets = limit ? bets.slice(0, limit) : bets;

      // Calculate user statistics
      const totalBets = bets.length;
      const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
      const totalWinAmount = bets.reduce(
        (sum, bet) => sum + (bet.win_amount || 0),
        0,
      );
      const winningBets = bets.filter((bet) => bet.result === 'win').length;

      return {
        success: true,
        data: {
          bets: limitedBets,
          userStatistics: {
            totalBets,
            totalBetAmount,
            totalWinAmount,
            winningBets,
            losingBets: totalBets - winningBets,
            winRate:
              totalBets > 0
                ? `${((winningBets / totalBets) * 100).toFixed(2)}%`
                : '0%',
            netProfitLoss: totalWinAmount - totalBetAmount,
            profitLoss: 0,
          },
        },
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }

  @Get('bets/user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all bets for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return all bets for the user',
    type: [UserBet],
  })
  async getUserBets(@Request() req): Promise<UserBet[]> {
    try {
      const userId = req.user.id;

      return await this.gameService.getUserBets(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('admin/results/recent')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get recent game results' })
  @ApiResponse({
    status: 200,
    description: 'Return recent game results',
    type: StandardResponseDto,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit number of results',
  })
  async getRecentResults(
    @Query('limit') limit?: number,
  ): Promise<StandardResponseDto<any[]>> {
    try {
      const results = await this.gameService.getRecentResults(limit || 20);
      return {
        success: true,
        data: results,
        total: results.length,
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }

  @Get('results/recent')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get recent game results by duration' })
  @ApiResponse({
    status: 200,
    description: 'Return recent game results filtered by duration',
    type: StandardResponseDto,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit number of results',
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    type: Number,
    description:
      'Filter by game duration (in minutes or seconds based on your schema)',
  })
  async getResults(
    @Query('limit') limit?: number,
    @Query('duration') duration?: string,
  ): Promise<StandardResponseDto<any[]>> {
    try {
      const results = await this.gameService.getRecentResults(
        limit || 20,
        duration,
      );
      return {
        success: true,
        data: results,
        total: results.length,
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }

  @Get('admin/transaction')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get recent game results' })
  @ApiResponse({
    status: 200,
    description: 'Return Transactions',
    type: StandardResponseDto,
  })
  // @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results' })
  async getTransactions(): Promise<StandardResponseDto<Transaction[]>> {
    try {
      const results = await this.gameService.getTransactions();
      return {
        success: true,
        data: results,
        total: results.length,
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }

  @Post('broadcast/message')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Broadcast a message to all connected clients (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Message broadcast successful' })
  broadcastMessage(@Body() message: { content: string; type: string }) {
    this.colorGameGateway.server.emit('broadcast', {
      timestamp: new Date().toISOString(),
      content: message.content,
      type: message.type || 'info',
    });

    return { success: true, message: 'Broadcast sent' };
  }

  @Post('notification/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Send notification to a specific room (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Notification sent successful' })
  sendRoomNotification(
    @Param('roomId') roomId: string,
    @Body() notification: { content: string; type: string },
  ) {
    this.colorGameGateway.server.to(roomId).emit('notification', {
      timestamp: new Date().toISOString(),
      content: notification.content,
      type: notification.type || 'info',
    });

    return { success: true, message: `Notification sent to room ${roomId}` };
  }

  @Post('force-refresh')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Force all clients to refresh their data (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Force refresh command sent' })
  forceRefresh(@Body() options: { target: string }) {
    const { target } = options;

    if (target === 'all' || !target) {
      this.colorGameGateway.server.emit('forceRefresh', { target: 'all' });
    } else {
      this.colorGameGateway.server.emit('forceRefresh', { target });
    }

    return {
      success: true,
      message: `Force refresh sent for ${target || 'all'}`,
    };
  }

  @Post('admin/games/force-end')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Force end all active games (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'All games force ended',
    type: StandardResponseDto,
  })
  async forceEndAllGames(): Promise<StandardResponseDto<null>> {
    try {
      await this.gameService.forceEndAllGames();
      return {
        success: true,
        message: 'All active games have been force ended',
        serverTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        serverTime: new Date().toISOString(),
      };
    }
  }
}
