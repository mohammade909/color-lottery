// src/modules/game/game.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { CreateGameDto } from './dto/create-game.dto';

import { UseGuards } from '@nestjs/common';

import { Logger } from '@nestjs/common';
import { GameService } from './coin.service';
import { FlipCoinDto } from './dto/game-response.dto';
import { WsJwtGuard } from 'src/auth/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin:'*',
  }
})
export class CoinGameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CoinGameGateway.name);
  private connectedUsers = new Map<string, number>(); // socketId -> userId

  constructor(private readonly gameService: GameService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract user info from token (you'll need to implement token validation)
      const userId = await this.extractUserFromToken(client);
      if (userId) {
        this.connectedUsers.set(client.id, userId);
        client.join(`user_${userId}`);
        this.logger.log(`User ${userId} connected with socket ${client.id}`);
      } else {
        client.disconnect();
      }
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('coin-flip/place_bet')
  async handlePlaceBet(
    @MessageBody() createGameDto: CreateGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = this.connectedUsers.get(client.id)?.toString();

      if (!userId) {
        throw new Error('User not authenticated');
      }
      const game = await this.gameService.createGame(userId, createGameDto);

      // Emit to user's room
      this.server.to(`user_${userId}`).emit('bet_placed', {
        success: true,
        game: game,
        message: 'Bet placed successfully',
      });

      return { success: true, game };
    } catch (error) {
      client.emit('bet_error', {
        success: false,
        message: error.message,
      });
      return { success: false, error: error.message };
    }
  }



  @UseGuards(WsJwtGuard)
  @SubscribeMessage('flip_coin')
  async handleFlipCoin(
    @MessageBody() flipCoinDto: FlipCoinDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Add delay for dramatic effect
      setTimeout(async () => {
        try {
          const result = await this.gameService.flipCoin(flipCoinDto.gameId, userId);
          
          // Emit coin flip animation start
          this.server.to(`user_${userId}`).emit('coin_flip_start', {
            gameId: flipCoinDto.gameId,
          });

          // Emit result after animation delay
          setTimeout(() => {
            this.server.to(`user_${userId}`).emit('coin_flip_result', {
              success: true,
              result: result,
              message: result.isWin ? 'Congratulations! You won!' : 'Better luck next time!',
            });
          }, 3000); // 3 second animation delay

        } catch (error) {
          client.emit('flip_error', {
            success: false,
            message: error.message,
          });
        }
      }, 500); // Small delay before starting

      return { success: true, message: 'Coin flip initiated' };
    } catch (error) {
      client.emit('flip_error', {
        success: false,
        message: error.message,
      });
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('get_game_history')
  async handleGetGameHistory(
    @MessageBody() data: { limit?: number; offset?: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const games = await this.gameService.getUserGames(
        userId,
        data.limit || 20,
        data.offset || 0,
      );

      client.emit('game_history', {
        success: true,
        games: games,
      });

      return { success: true };
    } catch (error) {
      client.emit('history_error', {
        success: false,
        message: error.message,
      });
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('get_game_stats')
  async handleGetGameStats(@ConnectedSocket() client: Socket) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const stats = await this.gameService.getGameStats(userId);

      client.emit('game_stats', {
        success: true,
        stats: stats,
      });

      return { success: true };
    } catch (error) {
      client.emit('stats_error', {
        success: false,
        message: error.message,
      });
      return { success: false, error: error.message };
    }
  }

  // Helper method to extract user from token
  private async extractUserFromToken(client: Socket): Promise<number | null> {
    try {
      // Extract token from handshake auth or query
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      
      if (!token) {
        return null;
      }

      // You'll need to implement JWT verification here
      // This is a placeholder - implement based on your JWT strategy
      // const decoded = this.jwtService.verify(token);
      // return decoded.userId;
      
      // For now, return a mock user ID (replace with actual implementation)
      return 1;
    } catch (error) {
      this.logger.error('Token extraction error:', error);
      return null;
    }
  }
}