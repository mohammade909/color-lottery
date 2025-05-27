import { io, Socket } from 'socket.io-client';
import { ColorGame, GameResult, UserBet } from '../types';

// Socket events enum
export enum SocketEvents {
  // Server -> Client events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ACTIVE_GAMES = 'activeGames',
  NEW_GAME = 'newGame',
  GAME_RESULT = 'gameResult',
  USER_BETS = 'userBets',
  BET_PLACED = 'betPlaced',
  RECENT_RESULTS = 'recentResults',
  
  // Client -> Server events
  GET_ACTIVE_GAMES = 'getActiveGames',
  GET_GAME_BY_ID = 'getGameById',
  GET_GAME_BY_DURATION = 'getGameByDuration',
  GET_GAME_BETS = 'getGameBets',
  GET_USER_BETS = 'getUserBets',
  GET_RECENT_RESULTS = 'getRecentResults',
  PLACE_BET = 'placeBet',
}

// Event listeners type
type EventListeners = {
  [SocketEvents.CONNECT]?: () => void;
  [SocketEvents.DISCONNECT]?: () => void;
  [SocketEvents.ACTIVE_GAMES]?: (games: ColorGame[]) => void;
  [SocketEvents.NEW_GAME]?: (game: ColorGame) => void;
  [SocketEvents.GAME_RESULT]?: (data: { gameId: string; result: GameResult }) => void;
  [SocketEvents.USER_BETS]?: (bets: UserBet[]) => void;
  [SocketEvents.BET_PLACED]?: (bet: UserBet) => void;
  [SocketEvents.RECENT_RESULTS]?: (results: GameResult[]) => void;
};

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private listeners: EventListeners = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  private constructor() {}
  
  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }
  
  public connect(url?: string): void {
    if (this.socket && this.socket.connected) return;
    
    // Default to environment variable or localhost
    const socketUrl = url || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8800';
    
    // Create socket connection
    this.socket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });
    
    // Set up core event listeners
    this.socket.on(SocketEvents.CONNECT, () => {
      console.log('Socket connected successfully');
      this.reconnectAttempts = 0;
      if (this.listeners[SocketEvents.CONNECT]) {
        this.listeners[SocketEvents.CONNECT]();
      }
    });
    
    this.socket.on(SocketEvents.DISCONNECT, () => {
      console.log('Socket disconnected');
      if (this.listeners[SocketEvents.DISCONNECT]) {
        this.listeners[SocketEvents.DISCONNECT]();
      }
    });
    
    // Set up game-specific listeners
    this.setupGameListeners();
  }
  
  private setupGameListeners(): void {
    if (!this.socket) return;
    
    this.socket.on(SocketEvents.ACTIVE_GAMES, (games: ColorGame[]) => {
      if (this.listeners[SocketEvents.ACTIVE_GAMES]) {
        this.listeners[SocketEvents.ACTIVE_GAMES](games);
      }
    });
    
    this.socket.on(SocketEvents.NEW_GAME, (game: ColorGame) => {
      if (this.listeners[SocketEvents.NEW_GAME]) {
        this.listeners[SocketEvents.NEW_GAME](game);
      }
    });
    
    this.socket.on(SocketEvents.GAME_RESULT, (data: { gameId: string; result: GameResult }) => {
      if (this.listeners[SocketEvents.GAME_RESULT]) {
        this.listeners[SocketEvents.GAME_RESULT](data);
      }
    });
    
    this.socket.on(SocketEvents.USER_BETS, (bets: UserBet[]) => {
      if (this.listeners[SocketEvents.USER_BETS]) {
        this.listeners[SocketEvents.USER_BETS](bets);
      }
    });
    
    this.socket.on(SocketEvents.BET_PLACED, (bet: UserBet) => {
      if (this.listeners[SocketEvents.BET_PLACED]) {
        this.listeners[SocketEvents.BET_PLACED](bet);
      }
    });
    
    this.socket.on(SocketEvents.RECENT_RESULTS, (results: GameResult[]) => {
      if (this.listeners[SocketEvents.RECENT_RESULTS]) {
        this.listeners[SocketEvents.RECENT_RESULTS](results);
      }
    });
  }
  
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  public on<T extends keyof EventListeners>(event: T, callback: EventListeners[T]): void {
    this.listeners[event] = callback;
  }
  
  public off(event: keyof EventListeners): void {
    delete this.listeners[event];
  }
  
  // Emit events to server
  public emit<T>(event: string, data?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      
      this.socket.timeout(5000).emit(event, data, (err: any, response: T) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response);
      });
    });
  }
  
  // Helper methods for common requests
  public getActiveGames(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(SocketEvents.GET_ACTIVE_GAMES);
    }
  }
  
  public getGameById(gameId: string): Promise<ColorGame> {
    return this.emit<ColorGame>(SocketEvents.GET_GAME_BY_ID, { gameId });
  }
  
  public getGameByDuration(duration: string): Promise<ColorGame> {
    return this.emit<ColorGame>(SocketEvents.GET_GAME_BY_DURATION, { duration });
  }
  
  public getGameBets(gameId: string): Promise<UserBet[]> {
    return this.emit<UserBet[]>(SocketEvents.GET_GAME_BETS, { gameId });
  }
  
  public getUserBets(userId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(SocketEvents.GET_USER_BETS, { userId });
    }
  }
  
  public getRecentResults(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(SocketEvents.GET_RECENT_RESULTS);
    }
  }
  
  public placeBet(betData: {
    user_id: string;
    period_id: string;
    bet_type: string;
    bet_value: string;
    amount: number;
  }): Promise<UserBet> {
    return this.emit<UserBet>(SocketEvents.PLACE_BET, betData);
  }
  
  public isConnected(): boolean {
    return !!this.socket && this.socket.connected;
  }
}

export default SocketManager.getInstance();