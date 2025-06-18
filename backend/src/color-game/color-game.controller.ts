

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { ColorGameService } from './color-game.service';
import { PlaceBetDto } from './dto/place-bet.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { ColorGame } from './entities/color-game.entity';
import { UserBet } from './entities/user-bet.entity';
import { GameResult } from './entities/game-result.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@ApiTags('color-game')
@Controller('color-game')
export class ColorGameController {
  constructor(private readonly colorGameService: ColorGameService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get all active games' })
  @ApiResponse({
    status: 200,
    description: 'Return all active games',
    type: [ColorGame],
  })
  async getActiveGames(): Promise<ColorGame[]> {
    try {
      return await this.colorGameService.getActiveGames();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({
    status: 200,
    description: 'Return game details',
    type: ColorGame,
  })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async getGameById(@Param('id') id: string): Promise<ColorGame> {
    try {
      const game = await this.colorGameService.getGameById(id);
      if (!game) {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }
      return game;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('/duration/:duration')
  @ApiOperation({ summary: 'Get game by duration' })
  @ApiParam({ name: 'duration', description: 'Game duration' })
  @ApiResponse({
    status: 200,
    description: 'Return game details',
    type: ColorGame,
  })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async getGameByDuration(
    @Param('duration') duration: string,
  ): Promise<ColorGame> {
    try {
      const game = await this.colorGameService.getGameByDuration(duration);
      if (!game) {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }
      return game;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('bet')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Place a bet on a game' })
  @ApiResponse({
    status: 201,
    description: 'Bet placed successfully',
    type: UserBet,
  })
  async placeBet(
    @Request() req,
    @Body() placeBetDto: PlaceBetDto,
  ): Promise<UserBet> {
    try {
      placeBetDto.user_id = req.user.id;

      return await this.colorGameService.placeBet(placeBetDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('bets/game/:gameId')
  @ApiOperation({ summary: 'Get all bets for a specific game' })
  @ApiParam({ name: 'gameId', description: 'Game ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all bets for the game',
    type: [UserBet],
  })
  async getGameBets(@Param('gameId') gameId: string): Promise<UserBet[]> {
    try {
      return await this.colorGameService.getGameBets(gameId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      return await this.colorGameService.getUserBets(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('results/all')
  @ApiOperation({ summary: 'Get recent game results' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Return recent game results',
    type: [GameResult],
  })
  @ApiResponse({ status: 404, description: 'No game results found' })
  async getRecentResults(
    @Query('limit') limit: number = 10,
  ): Promise<GameResult[]> {
    console.log(`[GameController] GET /results called with limit = ${limit}`);
    try {
      const results = await this.colorGameService.getRecentResults(limit);

      if (!results || results.length === 0) {
        console.warn('[GameController] No game results found');
        throw new NotFoundException('No game results found');
      }

      console.log(`[GameController] Retrieved ${results.length} game results`);
      return results;
    } catch (error) {
      if (error instanceof NotFoundException) {
        console.warn('[GameController] NotFoundException:', error.message);
        throw error;
      } else {
        console.error('[GameController] Error fetching game results:', error);
        throw new HttpException(
          'Error retrieving game results',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // Analytics and Statistics Endpoints

  @Get('analytics/game/:gameId')
  @ApiOperation({ summary: 'Get betting analysis for a specific game' })
  @ApiParam({ name: 'gameId', description: 'Game ID' })
  @ApiResponse({
    status: 200,
    description: 'Game betting analysis retrieved successfully',
  })
  async getGameBettingData(@Param('gameId') gameId: string) {
    try {
      const analysis =
        await this.colorGameService.getGameBettingAnalysis(gameId);
      return {
        success: true,
        message: 'Game betting analysis retrieved successfully',
        data: analysis,
      };
    } catch (error) {
      // this.logger.error(`Failed to get game betting analysis: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve betting analysis',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/active-games')
  @ApiOperation({ summary: 'Get betting statistics for all active games' })
  @ApiResponse({
    status: 200,
    description: 'Active games betting statistics retrieved successfully',
  })
  async getAllActiveGamesBettingStats() {
    try {
      const stats = await this.colorGameService.getAllActiveGamesBettingStats();
      return {
        success: true,
        message: 'Active games betting statistics retrieved successfully',
        data: stats,
        count: stats.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve betting statistics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/historical/:duration')
  @ApiOperation({
    summary: 'Get historical betting patterns for a specific duration',
  })
  @ApiParam({
    name: 'duration',
    description: 'Game duration',
    enum: ['30s', '1m', '3m', '5m'],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of games to analyze (default: 20)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Historical betting patterns retrieved successfully',
  })
  async getHistoricalBettingPatterns(
    @Param('duration') duration: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 20;
      const patterns = await this.colorGameService.getHistoricalBettingPatterns(
        duration,
        limitNum,
      );

      return {
        success: true,
        message: 'Historical betting patterns retrieved successfully',
        data: patterns,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve historical patterns',
          error: error.message,
        },
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Admin Endpoints

  @Post('admin/restart-games')
  @ApiOperation({ summary: 'Restart all games (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'All games restarted successfully',
  })
  async restartAllGames() {
    try {
      await this.colorGameService.startAllGames();
      return {
        success: true,
        message: 'All games restarted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to restart games',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/force-end-games')
  @ApiOperation({ summary: 'Force end all active games (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'All games force-ended successfully',
  })
  async forceEndAllGames() {
    try {
      await this.colorGameService.forceEndAllGames();
      return {
        success: true,
        message: 'All active games force-ended successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to force end games',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/toggle-manipulation/:gameId')
  @ApiOperation({
    summary: 'Toggle manipulation for a specific game (Admin only)',
  })
  @ApiParam({ name: 'gameId', description: 'Game ID' })
  @ApiQuery({
    name: 'enable',
    required: false,
    description: 'Enable manipulation (default: true)',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Manipulation toggled successfully',
  })
  async toggleManipulation(
    @Param('gameId') gameId: string,
    @Query('enable') enable?: string,
  ) {
    try {
      const enableManipulation = enable !== 'false'; // Default to true
      const result = await this.colorGameService.toggleManipulation(
        gameId,
        enableManipulation,
      );

      return {
        success: true,
        message: 'Manipulation setting updated successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to toggle manipulation',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Health Check Endpoint

  @Get('health')
  @ApiOperation({ summary: 'Health check for color game service' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  async healthCheck() {
    try {
      const activeGames = await this.colorGameService.getActiveGames();
      return {
        success: true,
        message: 'Color game service is healthy',
        data: {
          status: 'healthy',
          activeGames: activeGames.length,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Service health check failed',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
