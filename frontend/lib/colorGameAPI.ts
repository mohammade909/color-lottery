import { api } from './api';
import { ColorGame, GameResult, UserBet, PlaceBetDto } from '@/types';

export const colorGameAPI = {
  // Get all active games
  getActiveGames: async (): Promise<ColorGame[]> => {
    const response = await api.get('/color-game');
    return response.data;
  },
  
  // Get a specific game by ID
  getGameById: async (gameId: string): Promise<ColorGame> => {
    const response = await api.get(`/color-game/${gameId}`);
    return response.data;
  },
  
  // Place a bet
  placeBet: async (betData: PlaceBetDto): Promise<UserBet> => {
    const response = await api.post('/color-game/bet', betData);
    return response.data;
  },
  
  // Get recent game results
  getRecentResults: async (limit: number = 10): Promise<GameResult[]> => {
    const response = await api.get(`/color-game/results/all?limit=${limit}`);
    console.log(response.data)
    return response.data;
  },
  
  // Get user's bet history
  getUserBets: async (): Promise<UserBet[]> => {
    const response = await api.get('/color-game/bets/user');
    console.log(response.data)
    return response.data;
  },
  
  // Get bets for a specific game
  getGameBets: async (gameId: string): Promise<UserBet[]> => {
    const response = await api.get(`/color-game/${gameId}/bets`);
    return response.data;
  }
};