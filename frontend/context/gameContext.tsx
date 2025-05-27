'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  useSocketStore, 
  useSocketConnection, 
  ConnectionStatus, 
  PlaceBetRequest,
   
} from '../lib/socket';
import { ColorGame, GameResult, UserBet, BetType, ColorValue, SizeValue } from '../types';
import { formatDistanceToNow } from 'date-fns';

// Define the context type
interface GameContextType {
  // Connection status
  isConnected: boolean;
  isConnecting: boolean;
  
  // Game data
  activeGames: ColorGame[];
  activeGamesByDuration: Record<string, ColorGame>;
  recentResults: GameResult[];
  userBets: UserBet[];
  
  // Game state helpers
  getTimeRemaining: (game: ColorGame) => number;
  getFormattedTimeRemaining: (game: ColorGame) => string;
  
  // Actions
  placeBet: (bet: PlaceBetRequest) => Promise<UserBet | null>;
  refreshUserBets: (userId: string) => void;
}

// Create the context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Connect to socket
  const connectionStatus = useSocketConnection();
  
  // Get socket store state and methods
  const {
    activeGames,
    recentResults,
    userBets,
    placeBet: socketPlaceBet,
  } = useSocketStore();
  
  // Calculate connection status
  const isConnected = connectionStatus === ConnectionStatus.CONNECTED;
  const isConnecting = connectionStatus === ConnectionStatus.CONNECTING;
  
  // Format active games by duration for easy access
  const activeGamesByDuration = React.useMemo(() => {
    return activeGames.reduce<Record<string, ColorGame>>((acc, game) => {
      acc[game.duration] = game;
      return acc;
    }, {});
  }, [activeGames]);
  
  // Time-related helper functions
  const getTimeRemaining = (game: ColorGame): number => {
    if (!game || !game.end_time) return 0;
    
    const endTime = new Date(game.end_time).getTime();
    const now = Date.now();
    return Math.max(0, endTime - now);
  };
  
  const getFormattedTimeRemaining = (game: ColorGame): string => {
    const ms = getTimeRemaining(game);
    
    if (ms <= 0) return '00:00';
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Refresh user bets
  const refreshUserBets = (userId: string) => {
    if (isConnected && userId) {
      useSocketStore.getState().socket?.emit('getUserBets', { userId });
    }
  };
  
  // Wrapped place bet function
  const placeBet = async (bet: PlaceBetRequest): Promise<UserBet | null> => {
    if (!isConnected) {
      throw new Error('Socket not connected');
    }
    return socketPlaceBet(bet);
  };
  
  // Context value
  const value = {
    isConnected,
    isConnecting,
    activeGames,
    activeGamesByDuration,
    recentResults,
    userBets,
    getTimeRemaining,
    getFormattedTimeRemaining,
    placeBet,
    refreshUserBets,
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook to use the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};