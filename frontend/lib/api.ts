// import { ApiResponse } from "@/types";
// import axios from "axios";

// const API_URL = "http://localhost:8800";

// export const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Add a request interceptor to include the token in requests
// api.interceptors.request.use(
//   (config) => {
//     try {
//       // Safely get the token from localStorage with proper error handling
//       const authStorageString = localStorage.getItem("auth-storage");

//       if (authStorageString) {
//         const userData = JSON.parse(authStorageString);
//         const token = userData?.state?.token;

//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//       }
//       // If there's no token, just continue without Authorization header
//       return config;
//     } catch (error) {
//       // If there's an error parsing the storage, just continue without adding the token
//       console.error("Error accessing auth token:", error);
//       return config;
//     }
//   },
//   (error) => Promise.reject(error)
// );

// export const authAPI = {
//   login: async (username: string, password: string) => {
//     const response = await api.post("/auth/login", { username, password });

//     return response.data;
//   },
//   register: async (username: string, email: string, password: string) => {
//     const response = await api.post("/auth/register", {
//       username,
//       email,
//       password,
//     });
//     return response.data;
//   },
//   getProfile: async (id: string) => {
//     const response = await api.get(`/users/${id}`);
//     return response.data;
//   },
// };

// export const colorGameAPI = {
//   // getActiveGames: async () => {
//   //   const response = await api.get('/color-game/active');
//   //   return response.data;
//   // },

//   getActiveGames: async () => {
//     const response = await api.get("/websocket/active/games");
//     return response.data;
//   },

//   getGameById: async (id: string) => {
//     const response = await api.get(`/color-game/${id}`);
//     return response.data;
//   },

//   getGameByDuration: async (duration: string) => {
//     const response = await api.get(`/websocket/game/${duration}`);
//     return response.data;
//   },

//   placeBet: async (betData: {
//     user_id: string;
//     period_id: string;
//     period: string;
//     bet_type: string;
//     bet_value: string;
//     amount: number;
//     multiplier: number;
//   }) => {
//     const response = await api.post("/color-game/bet", betData);
//     return response.data;
//   },

//   getGameBets: async (gameId: string) => {
//     const response = await api.get(`/color-game/bets/game/${gameId}`);
//     return response.data;
//   },

//   getUserBets: async () => {
//     const response = await api.get(`/websocket/bets/user`);
//     return response.data;
//   },

//   getRecentResults: async (duration: string) => {
//     const response = await api.get(
//       `/websocket/results/recent?duration=${duration}`
//     );
//     return response.data.data;
//   },

//   // getRecentResults: async (limit = 10) => {
//   //   const response = await api.get(`/color-game/results/all`);
//   //   return response.data;
//   // },
// };

// export const transactionAPI = {
//   getAllTransactions: async () => {
//     const response = await api.get("/transactions/with-user");
//     return response.data;
//   },

//   getTransactionById: async (id: string) => {
//     const response = await api.get(`/${id}`);
//     return response.data;
//   },

//   getUserTransactions: async (id: string) => {
//     const response = await api.get(`/transactions/user/${id}`);
//     return response.data;
//   },
// };
// export const userAPI = {
//   getUsers: async (
//     page: number = 1,
//     limit: number = 10,
//     search?: string,
//     role?: string
//   ): Promise<{
//     data: {
//       id: string;
//       username: string;
//       email: string;
//       createdAt: string;
//       updatedAt: string;
//       wallet: number;
//       role: "user" | "admin";
//     }[];
//     total: number;
//     page: number;
//     limit: number;
//     totalPages: number;
//   }> => {
//     const params = new URLSearchParams({
//       page: page.toString(),
//       limit: limit.toString(),
//       ...(search && { search }),
//       ...(role && role !== "all" && { role }),
//     });
//     const response = await api.get(`/users?${params}`);
//     return response.data;
//   },
// };


import { ApiResponse } from "@/types";
import axios from "axios";

const API_URL = "http://localhost:8800";

export const WEBSOCKET_URL = "http://localhost:8800";
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in requests
api.interceptors.request.use(
  (config) => {
    try {
      // Safely get the token from localStorage with proper error handling
      const authStorageString = localStorage.getItem("auth-storage");

      if (authStorageString) {
        const userData = JSON.parse(authStorageString);
        const token = userData?.state?.token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      // If there's no token, just continue without Authorization header
      return config;
    } catch (error) {
      // If there's an error parsing the storage, just continue without adding the token
      console.error("Error accessing auth token:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Types for Coin Flip Game
export interface Game {
  id: number;
  user_id: number;
  bet_amount: number;
  bet_choice: 'heads' | 'tails';
  result?: 'heads' | 'tails';
  won_amount: number;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface GameResult {
  gameId: number;
  userId: number;
  betChoice: 'heads' | 'tails';
  result: 'heads' | 'tails';
  betAmount: number;
  wonAmount: number;
  isWin: boolean;
  newBalance: number;
}

export interface GameStats {
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  totalBet: number;
  totalWon: number;
  netProfit: number;
  winRate: number;
}

export interface CreateGameDto {
  bet_amount: number;
  bet_choice: 'heads' | 'tails';
}

// Coin Flip Game APIs
export const coinFlipAPI = {
  // Create a new game (place bet)
  createGame: async (betData: CreateGameDto): Promise<Game> => {
    const response = await api.post("/coin-flip", betData);
    return response.data;
  },

  // Flip coin for a specific game
  flipCoin: async (gameId: number): Promise<GameResult> => {
    const response = await api.post(`/coin-flip/${gameId}/flip`);
    return response.data;
  },

  // Get a specific game by ID
  getGameById: async (gameId: number): Promise<Game> => {
    const response = await api.get(`/flip-coin/${gameId}`);
    return response.data;
  },

  // Get user's game history with pagination
  getUserGames: async (limit: number = 20, offset: number = 0): Promise<Game[]> => {
    const response = await api.get(`/flip-coin?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  // Get user's game statistics
  getGameStats: async (): Promise<GameStats> => {
    const response = await api.get("/flip-coin/stats/summary");
    return response.data;
  },
};

// WebSocket helper to get auth token
export const getAuthToken = (): string | null => {
  try {
    const authStorageString = localStorage.getItem("auth-storage");
    if (authStorageString) {
      const userData = JSON.parse(authStorageString);
      return userData?.state?.token || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// WebSocket URL for coin flip game


// Existing APIs (keeping your original structure)
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },
  register: async (username: string, email: string, password: string) => {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get(`/users/profile`);
    return response.data;
  },
};

export const colorGameAPI = {
  getActiveGames: async () => {
    const response = await api.get("/websocket/active/games");
    return response.data;
  },

  getGameById: async (id: string) => {
    const response = await api.get(`/color-game/${id}`);
    return response.data;
  },

  getGameByDuration: async (duration: string) => {
    const response = await api.get(`/websocket/game/${duration}`);
    return response.data;
  },

  placeBet: async (betData: {
    user_id: string;
    period_id: string;
    period: string;
    bet_type: string;
    bet_value: string;
    amount: number;
    multiplier: number;
  }) => {
    const response = await api.post("/color-game/bet", betData);
    return response.data;
  },

  getGameBets: async (gameId: string) => {
    const response = await api.get(`/color-game/bets/game/${gameId}`);
    return response.data;
  },

  getUserBets: async () => {
    const response = await api.get(`/websocket/bets/user`);
    return response.data;
  },

  getRecentResults: async (duration: string) => {
    const response = await api.get(
      `/websocket/results/recent?duration=${duration}`
    );
    return response.data.data;
  },
};

export const transactionAPI = {
  getAllTransactions: async () => {
    const response = await api.get("/transactions/with-user");
    return response.data;
  },

  getTransactionById: async (id: string) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  getUserTransactions: async (id: string) => {
    const response = await api.get(`/transactions/user/${id}`);
    return response.data;
  },
};

export const userAPI = {
  getUsers: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string
  ): Promise<{
    data: {
      id: string;
      username: string;
      email: string;
      createdAt: string;
      updatedAt: string;
      wallet: number;
      role: "user" | "admin";
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && role !== "all" && { role }),
    });
    const response = await api.get(`/users?${params}`);
    return response.data;
  },
};