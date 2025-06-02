// src/modules/game/game.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GameService } from './coin.service';
import { CreateGameDto } from './dto/create-game.dto';
import { GameResponseDto } from './dto/game-response.dto';

@Controller('coin-flip')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}
  @Post()
  async createGame(
    @Request() req,
    @Body() createGameDto: CreateGameDto,
  ): Promise<GameResponseDto> {
    return this.gameService.createGame(req.user.id, createGameDto);
  }

  @Post(':id/flip')
  async flipCoin(@Request() req, @Param('id', ParseIntPipe) gameId: number) {
    return this.gameService.flipCoin(gameId, req.user.id);
  }

  @Get(':id')
  async getGame(
    @Request() req,
    @Param('id', ParseIntPipe) gameId: number,
  ): Promise<GameResponseDto> {
    return this.gameService.getGameById(gameId, req.user.userId);
  }

  @Get()
  async getUserGames(
    @Request() req,
    @Query('limit', ParseIntPipe) limit: number = 20,
    @Query('offset', ParseIntPipe) offset: number = 0,
  ): Promise<GameResponseDto[]> {
    return this.gameService.getUserGames(req.user.userId, limit, offset);
  }

  @Get('stats/summary')
  async getGameStats(@Request() req) {
    return this.gameService.getGameStats(req.user.userId);
  }
}
