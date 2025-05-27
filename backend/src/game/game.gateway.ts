import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsResponse,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Logger, Injectable, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { PlaceBetDto } from './dto/place-bet.dto';
import { Interval } from '@nestjs/schedule';

@WebSocketGateway({
  cors: {
    origin: '*',  // In production, limit this to your frontend domain
  },
})
@Injectable()
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GameGateway.name);
  private clientRooms: Map<string, string[]> = new Map();  // Map of room name to client IDs
  @WebSocketServer()
  server: Server;
    constructor(
    @Inject(forwardRef(() => GameService)) // Add forwardRef here
    private readonly colorGameService: GameService
  ) {}
  // constructor(private readonly colorGameService: GameService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove client from rooms they were in
    this.clientRooms.forEach((clients, room) => {
      const index = clients.indexOf(client.id);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    });
  }

  // Client subscribing to active games updates
  @SubscribeMessage('subscribeToActiveGames')
  async handleSubscribeToActiveGames(
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = 'active-games';
    client.join(roomName);
    
    // Track the client in this room
    if (!this.clientRooms.has(roomName)) {
      this.clientRooms.set(roomName, []);
    }
    
    const clients = this.clientRooms.get(roomName);
    if (clients) {
      clients.push(client.id);
    }
    
    // Send initial active games data
    const activeGames = await this.colorGameService.getActiveGames();
    return { event: 'activeGames', data: activeGames };
  }

  // Client subscribing to a specific game
  @SubscribeMessage('subscribeToGame')
  async handleSubscribeToGame(
    @MessageBody() gameId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `game-${gameId}`;
    client.join(roomName);
    
    // Track the client in this room
    if (!this.clientRooms.has(roomName)) {
      this.clientRooms.set(roomName, []);
    }
    
    const clients = this.clientRooms.get(roomName);
    if (clients) {
      clients.push(client.id);
    }
    
    // Send initial game data
    const game = await this.colorGameService.getGameById(gameId);
    const bets = await this.colorGameService.getGameBets(gameId);
    
    return { 
      event: 'gameData', 
      data: { 
        game,
        bets,
        remainingTime: game?.end_time ? 
          Math.max(0, new Date(game.end_time).getTime() - Date.now()) : 0
      }
    };
  }

  // Client subscribing to recent game results
  @SubscribeMessage('subscribeToRecentResults')
  async handleSubscribeToRecentResults(
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = 'recent-results';
    client.join(roomName);
    
    // Track the client in this room
    if (!this.clientRooms.has(roomName)) {
      this.clientRooms.set(roomName, []);
    }
    
    const clients = this.clientRooms.get(roomName);
    if (clients) {
      clients.push(client.id);
    }
    
    // Send initial recent results
    const recentResults = await this.colorGameService.getRecentResults(20);
    return { event: 'recentResults', data: recentResults };
  }
  @SubscribeMessage('subscribeToRecentTranscation')
  async handleSubscribeToRecentTransactions(
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = 'recent-transactions';
    client.join(roomName);
    
    // Track the client in this room
    if (!this.clientRooms.has(roomName)) {
      this.clientRooms.set(roomName, []);
    }
    
    const clients = this.clientRooms.get(roomName);
    if (clients) {
      clients.push(client.id);
    }
    
    // Send initial recent results
    const recentResults = await this.colorGameService.getTransactions();
    return { event: 'recentTransactions', data: recentResults };
  }

  // Client subscribing to user bets
  @SubscribeMessage('subscribeToUserBets')
  async handleSubscribeToUserBets(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `user-bets-${userId}`;
    client.join(roomName);
    
    // Track the client in this room
    if (!this.clientRooms.has(roomName)) {
      this.clientRooms.set(roomName, []);
    }
    
    const clients = this.clientRooms.get(roomName);
    if (clients) {
      clients.push(client.id);
    }
    
    // Send initial user bets data
    const userBets = await this.colorGameService.getUserBets(userId);
    return { event: 'userBets', data: userBets };
  }

  // Handle placing bets through WebSocket
  @SubscribeMessage('placeBet')
  async handlePlaceBet(
    @MessageBody() betData: PlaceBetDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.colorGameService.placeBet(betData);
      
      // Emit the new bet to all clients subscribed to this game
      this.server.to(`game-${betData.period_id}`).emit('newBet', result);
      
      // Also emit to the user's personal room
      this.server.to(`user-bets-${betData.user_id}`).emit('newUserBet', result);

      // Emit updated game data with total bets
      const updatedGame = await this.colorGameService.getGameById(betData.period_id);
      this.server.to(`game-${betData.period_id}`).emit('gameUpdated', updatedGame);
      
      return { event: 'betPlaced', data: result };
    } catch (error) {
      return { event: 'betError', data: { message: error.message } };
    }
  }

  // Send active games updates every second
  @Interval(1000)
  async sendActiveGamesUpdates() {
    const activeGamesClients = this.clientRooms.get('active-games');
    if (activeGamesClients && activeGamesClients.length > 0) {
      const activeGames = await this.colorGameService.getActiveGames();
      
      // Add remaining time to each game
      const gamesWithTime = activeGames.map(game => ({
        ...game,
        remainingTime: game.end_time ? 
          Math.max(0, new Date(game.end_time).getTime() - Date.now()) : 0
      }));
      
      this.server.to('active-games').emit('activeGames', gamesWithTime);
    }
  }

  // Emit game result when a game ends
  async emitGameResult(gameId: string, result: any) {
    this.server.to(`game-${gameId}`).emit('gameResult', result);
    
    // Also update the recent results for subscribed clients
    const recentResults = await this.colorGameService.getRecentResults(20);
    this.server.to('recent-results').emit('recentResults', recentResults);
    
    // Get the new game that replaced this one
    const newGame = await this.colorGameService.getGameByDuration(result.duration);
    if (newGame) {
      this.server.to('active-games').emit('newGame', newGame);
    }
  }
}