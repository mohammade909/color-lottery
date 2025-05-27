import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

// Define event types based on your WebSocket Gateway
type GameData = {
  game: any;
  bets: any[];
  remainingTime: number;
};

type BetData = {
  user_id: string;
  period_id: string;
  color: string;
  amount: number;
};

export interface SocketHook {
  socket: Socket | null;
  isConnected: boolean;
  activeGames: any[];
  currentGame: GameData | null;
  recentResults: any[];
  userBets: any[];
  placeBet: (betData: BetData) => Promise<any>;
  subscribeToGame: (gameId: string) => void;
  subscribeToUserBets: (userId: string) => void;
}

// This function creates and configures the socket connection
const createSocket = (token: string): Socket => {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
  
  const socket = io(socketUrl, {
    auth: {
      token,
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
  
  return socket;
};

export const useSocket = (): SocketHook => {
  const { token, user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeGames, setActiveGames] = useState<any[]>([]);
  const [currentGame, setCurrentGame] = useState<GameData | null>(null);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [userBets, setUserBets] = useState<any[]>([]);
  
  // Store socket reference for event cleanup
  const socketRef = useRef<Socket | null>(null);

  // Connect to socket
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const socketInstance = createSocket(token);
    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      
      // Subscribe to active games by default
      socketInstance.emit('subscribeToActiveGames', {}, (response: any) => {
        if (response && response.data) {
          setActiveGames(response.data);
        }
      });
      
      // Subscribe to recent results by default
      socketInstance.emit('subscribeToRecentResults', {}, (response: any) => {
        if (response && response.data) {
          setRecentResults(response.data);
        }
      });
      
      // Subscribe to user bets if user is authenticated
      if (user?.id) {
        socketInstance.emit('subscribeToUserBets', user.id, (response: any) => {
          if (response && response.data) {
            setUserBets(response.data);
          }
        });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Data update listeners
    socketInstance.on('activeGames', (data) => {
      setActiveGames(data);
    });

    socketInstance.on('gameData', (data) => {
      setCurrentGame(data);
    });

    socketInstance.on('gameUpdated', (data) => {
      setCurrentGame(prev => prev ? { ...prev, game: data } : null);
    });

    socketInstance.on('newBet', (bet) => {
      setCurrentGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          bets: [...prev.bets, bet]
        };
      });
    });

    socketInstance.on('recentResults', (data) => {
      setRecentResults(data);
    });

    socketInstance.on('userBets', (data) => {
      setUserBets(data);
    });

    socketInstance.on('newUserBet', (bet) => {
      setUserBets(prev => [...prev, bet]);
    });

    socketInstance.on('gameResult', (result) => {
      // Update recent results when a game ends
      setRecentResults(prev => [result, ...prev.slice(0, 19)]);
      
      // Clear current game if it matches the ended game
      setCurrentGame(prev => 
        prev && prev.game.id === result.id ? null : prev
      );
    });

    socketInstance.on('newGame', (game) => {
      setActiveGames(prev => {
        // Replace the game with matching duration or add to the list
        const index = prev.findIndex(g => g.duration === game.duration);
        if (index !== -1) {
          const newGames = [...prev];
          newGames[index] = game;
          return newGames;
        }
        return [...prev, game];
      });
    });

    socketInstance.on('broadcast', (message) => {
      // Handle broadcast messages (could trigger a notification)
      console.log('Broadcast received:', message);
      // You could add a toast notification here
    });

    socketInstance.on('forceRefresh', ({ target }) => {
      // Handle force refresh commands
      if (target === 'all' || target === 'games') {
        // Refresh game data
        socketInstance.emit('subscribeToActiveGames');
        if (currentGame?.game?.id) {
          socketInstance.emit('subscribeToGame', currentGame.game.id);
        }
      }
      
      if (target === 'all' || target === 'results') {
        // Refresh results
        socketInstance.emit('subscribeToRecentResults');
      }
      
      if ((target === 'all' || target === 'user') && user?.id) {
        // Refresh user data
        socketInstance.emit('subscribeToUserBets', user.id);
      }
    });

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, token, user?.id]);

  // Subscribe to a specific game
  const subscribeToGame = useCallback((gameId: string) => {
    if (socket && isConnected) {
      socket.emit('subscribeToGame', gameId, (response: any) => {
        if (response && response.data) {
          setCurrentGame(response.data);
        }
      });
    }
  }, [socket, isConnected]);

  // Subscribe to user bets
  const subscribeToUserBets = useCallback((userId: string) => {
    if (socket && isConnected) {
      socket.emit('subscribeToUserBets', userId, (response: any) => {
        if (response && response.data) {
          setUserBets(response.data);
        }
      });
    }
  }, [socket, isConnected]);

  // Place a bet
  const placeBet = useCallback((betData: BetData): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }
      
      socket.emit('placeBet', betData, (response: any) => {
        if (response.event === 'betPlaced') {
          resolve(response.data);
        } else {
          reject(new Error(response.data?.message || 'Failed to place bet'));
        }
      });
    });
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    activeGames,
    currentGame,
    recentResults,
    userBets,
    placeBet,
    subscribeToGame,
    subscribeToUserBets,
  };
};

// Socket context provider (alternative approach)
