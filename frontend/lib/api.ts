import { ApiResponse } from '@/types';
import axios from 'axios';

const API_URL = 'http://localhost:8800';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in requests
api.interceptors.request.use(
  (config) => {
    try {
      // Safely get the token from localStorage with proper error handling
      const authStorageString = localStorage.getItem('auth-storage');
      
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

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    
    return response.data;
  },
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },
  getProfile: async (id: string) => {
    const response = await api.get(`/users/${id}`,);
    return response.data;
  },
};

export const colorGameAPI = {
  getActiveGames: async () => {
    const response = await api.get('/color-game/active');
    return response.data;
  },
  
  getGameById: async (id: string) => {
    const response = await api.get(`/color-game/${id}`);
    return response.data;
  },
  
  getGameByDuration: async (duration: string) => {
    const response = await api.get(`/color-game/duration/${duration}`);
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
    const response = await api.post('/color-game/bet', betData);
    return response.data;
  },
  
  getGameBets: async (gameId: string) => {
    const response = await api.get(`/color-game/bets/game/${gameId}`);
    return response.data;
  },
  
  getUserBets: async () => {
    const response = await api.get(`/color-game/bets/user`);
    return response.data;
  },
  
  // getRecentResults: async (limit = 10) => {
  //   const response = await api.get(`/websocket/admin/results/recent?limit=10`);
  //   console.log(response.data)
  //   return response.data.data;
  // },
  getRecentResults: async (limit = 10) => {
    const response = await api.get(`/color-game/results/all`);
    return response.data;
  },
};
export const transactionAPI = {
  getAllTransactions: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },
  
  getTransactionById: async (id: string) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },
  
  getUserTransactions: async (id:string) => {
    const response = await api.get(`/transactions/user/${id}`);
    return response.data;
  },

};


  // export const apiCall = async <T,>(endpoint: string): Promise<ApiResponse<T>> => {
  //   const token = getAuthToken();
    
  //   const response = await fetch(`${WS_ENDPOINT}${endpoint}`, {
  //     method: 'GET',
  //     headers: {
  //       'Authorization': `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     },
  //   });

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }

  //   return response.json();
  // };