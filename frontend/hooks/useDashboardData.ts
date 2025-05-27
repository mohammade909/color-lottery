// src/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { GameStatistics, ActiveGame, RecentResult, ApiResponse, DashboardState, Transaction } from '@/types/dashboard';

const API_BASE_URL = 'http://localhost:8800';
const WS_ENDPOINT = `${API_BASE_URL}/websocket`;

const getAuthToken = () => {
  return localStorage.getItem('authToken') || 'your-jwt-token-here';
};

const apiCall = async <T,>(endpoint: string): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  
  const response = await fetch(`${WS_ENDPOINT}${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const useDashboardData = () => {
  const [state, setState] = useState<DashboardState>({
    statistics: null,
    activeGames: [],
    recentResults: [],
    transactions:[],
    loading: true,
    error: null,
    connectionStatus: 'disconnected',
    refreshing: false,
  });

  const fetchStatistics = async () => {
    const response = await apiCall<GameStatistics>('/admin/statistics?days=7');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch statistics');
  };

  const fetchActiveGames = async () => {
    const response = await apiCall<ActiveGame[]>('/admin/games/active');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch active games');
  };

  const fetchRecentResults = async () => {
    const response = await apiCall<RecentResult[]>('/admin/results/recent?limit=10');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch recent results');
  };
  const fetchTransactions = async () => {
    const response = await apiCall<Transaction[]>('/admin/transactions');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch recent results');
  };
  const fetchUserTransactions = async () => {
    const response = await axios.get('http://localhost:8800/transactions');
    if (response.data && response.data) {
      return response.data;
    }
    throw new Error(response.data.error || 'ailed to fetch recent results');
  };

  const checkWebSocketStatus = async () => {
    try {
      const response = await axios.get(`${WS_ENDPOINT}/check-status`);
      return response.data?.status || 'disconnected';
    } catch (err) {
      console.error('Error checking WebSocket status:', err);
      return 'error';
    }
  };

  const loadData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [statistics, activeGames, recentResults, connectionStatus,] = await Promise.all([
        fetchStatistics(),
        fetchActiveGames(),
        fetchRecentResults(),
        checkWebSocketStatus(),
        // fetchTransactions()
      ]);
      
      setState(prev => ({
        ...prev,
        statistics,
        activeGames,
        recentResults,
        connectionStatus,

        loading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load dashboard data',
        loading: false,
      }));
    }
  };

  const handleRefresh = async () => {
    setState(prev => ({ ...prev, refreshing: true }));
    await loadData();
    setState(prev => ({ ...prev, refreshing: false }));
  };

  const handleForceEndGames = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${WS_ENDPOINT}/admin/games/force-end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        alert('All active games have been force ended');
        await loadData();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert('Failed to force end games');
    }
  };

  const broadcastMessage = async () => {
    const message = prompt('Enter broadcast message:');
    if (!message) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${WS_ENDPOINT}/broadcast/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          type: 'admin'
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Message broadcast successfully');
      } else {
        alert('Failed to broadcast message');
      }
    } catch (err) {
      alert('Failed to broadcast message');
    }
  };

  useEffect(() => {
    loadData();
    
    const interval = setInterval(() => {
      if (!state.refreshing) {
        loadData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...state,
    handleRefresh,
    handleForceEndGames,
    broadcastMessage,
  };
};