'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Play, Square, ToggleLeft, ToggleRight, AlertTriangle, BarChart3, Users, Clock, DollarSign, Activity } from 'lucide-react';

// API base URL - update this to match your backend
const API_BASE_URL = 'http://localhost:8800'; // Change this to your actual API URL

// Type definitions
interface Game {
  id: string;
  duration: string;
  status: 'active' | 'betting' | 'ended' | 'waiting';
  startTime: string;
  endTime: string;
  isManipulated: boolean;
}

interface BettingStat {
  duration: string;
  totalBets?: number;
  totalAmount?: number;
  popularColor?: string;
  status: 'active' | 'betting' | 'ended' | 'waiting';
}

interface GameResult {
  winningColor: string;
  duration: string;
  endTime: string;
  totalBets?: number;
  totalAmount?: number;
}

interface ColorBreakdown {
  [color: string]: {
    bets: number;
    amount: number;
  };
}

interface GameAnalysis {
  totalBets?: number;
  totalAmount?: number;
  colorBreakdown?: ColorBreakdown;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

type GameStatus = 'active' | 'betting' | 'ended' | 'waiting';
type GameColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange';

const Manipulation: React.FC = () => {
  const [activeGames, setActiveGames] = useState<Game[]>([]);
  const [bettingStats, setBettingStats] = useState<BettingStat[]>([]);
  const [recentResults, setRecentResults] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameAnalysis, setGameAnalysis] = useState<GameAnalysis | null>(null);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch active games
  const fetchActiveGames = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/color-game/active-games`);
      const result: ApiResponse<Game[]> = await response.json();
      setActiveGames(result.success ? result.data || [] : []);
    } catch (err) {
      setError('Failed to fetch active games');
      setActiveGames([]);
    }
  }, []);

  // Fetch betting statistics
  const fetchBettingStats = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/color-game/analytics/active-games`);
      const result: ApiResponse<BettingStat[]> = await response.json();
      setBettingStats(result.success ? result.data || [] : []);
    } catch (err) {
      setError('Failed to fetch betting statistics');
      setBettingStats([]);
    }
  }, []);

  // Fetch recent results
  const fetchRecentResults = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/color-game/results?limit=10`);
      const result: ApiResponse<GameResult[]> = await response.json();
      setRecentResults(result.success ? result.data || [] : []);
    } catch (err) {
      setError('Failed to fetch recent results');
      setRecentResults([]);
    }
  }, []);

  // Fetch game analysis
  const fetchGameAnalysis = useCallback(async (gameId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/color-game/analytics/game/${gameId}`);
      const result: ApiResponse<GameAnalysis> = await response.json();
      setGameAnalysis(result.success ? result.data || null : null);
    } catch (err) {
      setError('Failed to fetch game analysis');
      setGameAnalysis(null);
    }
  }, []);

  // Restart all games
  const restartAllGames = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/color-game/admin/restart-games`, {
        method: 'POST',
      });
      const result: ApiResponse<any> = await response.json();
      if (result.success) {
        alert('All games restarted successfully');
        await fetchData();
      } else {
        alert('Failed to restart games: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Error restarting games: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
    setLoading(false);
  };

  // Force end all games
  const forceEndAllGames = async (): Promise<void> => {
    if (!confirm('Are you sure you want to force end all active games?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/color-game/admin/force-end-games`, {
        method: 'POST',
      });
      const result: ApiResponse<any> = await response.json();
      if (result.success) {
        alert('All games force-ended successfully');
        await fetchData();
      } else {
        alert('Failed to force end games: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Error force ending games: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
    setLoading(false);
  };

  // Toggle manipulation for a game
  const toggleManipulation = async (gameId: string, enable: boolean): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/color-game/admin/toggle-manipulation/${gameId}?enable=${enable}`, {
        method: 'POST',
      });
      const result: ApiResponse<any> = await response.json();
      if (result.success) {
        alert(`Manipulation ${enable ? 'enabled' : 'disabled'} successfully`);
        await fetchData();
      } else {
        alert('Failed to toggle manipulation: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Error toggling manipulation: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
    setLoading(false);
  };

  // Fetch all data
  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');
    await Promise.all([
      fetchActiveGames(),
      fetchBettingStats(),
      fetchRecentResults()
    ]);
    setLastUpdated(new Date());
    setLoading(false);
  }, [fetchActiveGames, fetchBettingStats, fetchRecentResults]);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (selectedGame) {
      fetchGameAnalysis(selectedGame.id);
    }
  }, [selectedGame, fetchGameAnalysis]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount || 0);
  };

  const formatTime = (date: string): string => {
    return new Date(date).toLocaleTimeString();
  };

  const getStatusColor = (status: GameStatus): string => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'betting': return 'text-blue-600 bg-blue-100';
      case 'ended': return 'text-gray-600 bg-gray-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getColorBadge = (color: string): string => {
    const colors: Record<GameColor, string> = {
      red: 'bg-red-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500'
    };
    return colors[color as GameColor] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Color Game Admin Dashboard</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Game Controls</h2>
          <div className="flex gap-4">
            <button
              onClick={restartAllGames}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Restart All Games
            </button>
            <button
              onClick={forceEndAllGames}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Square className="w-4 h-4" />
              Force End All Games
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Games</p>
                <p className="text-2xl font-bold">{activeGames.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Bets</p>
                <p className="text-2xl font-bold">
                  {bettingStats.reduce((sum, game) => sum + (game.totalBets || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(bettingStats.reduce((sum, game) => sum + (game.totalAmount || 0), 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Recent Results</p>
                <p className="text-2xl font-bold">{recentResults.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Games */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Active Games</h2>
            <div className="space-y-4">
              {activeGames.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No active games</p>
              ) : (
                activeGames.map((game) => (
                  <div key={game.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">{game.duration}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                          {game.status}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedGame(game)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div>Started: {formatTime(game.startTime)}</div>
                      <div>Ends: {formatTime(game.endTime)}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Manipulation: {game.isManipulated ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => toggleManipulation(game.id, !game.isManipulated)}
                        disabled={loading}
                        className="flex items-center gap-1 text-sm"
                      >
                        {game.isManipulated ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                        Toggle
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Results</h2>
            <div className="space-y-3">
              {recentResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent results</p>
              ) : (
                recentResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getColorBadge(result.winningColor)}`}></div>
                        <span className="font-medium capitalize">{result.winningColor}</span>
                        <span className="text-sm text-gray-500">{result.duration}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(result.endTime)}
                      </div>
                    </div>
                    {result.totalBets && (
                      <div className="mt-2 text-sm text-gray-600">
                        {result.totalBets} bets • {formatCurrency(result.totalAmount || 0)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Betting Statistics */}
        {bettingStats.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Betting Statistics</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Duration</th>
                    <th className="text-left py-3 px-4">Total Bets</th>
                    <th className="text-left py-3 px-4">Total Amount</th>
                    <th className="text-left py-3 px-4">Popular Color</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bettingStats.map((stat, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{stat.duration}</td>
                      <td className="py-3 px-4">{stat.totalBets || 0}</td>
                      <td className="py-3 px-4">{formatCurrency(stat.totalAmount || 0)}</td>
                      <td className="py-3 px-4">
                        {stat.popularColor && (
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getColorBadge(stat.popularColor)}`}></div>
                            <span className="capitalize">{stat.popularColor}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stat.status)}`}>
                          {stat.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Game Analysis Modal */}
        {selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">
                    Game Details - {selectedGame.duration}
                  </h3>
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Game ID</p>
                      <p className="font-medium">{selectedGame.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedGame.status)}`}>
                        {selectedGame.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Start Time</p>
                      <p className="font-medium">{formatTime(selectedGame.startTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Time</p>
                      <p className="font-medium">{formatTime(selectedGame.endTime)}</p>
                    </div>
                  </div>
                  
                  {gameAnalysis && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Betting Analysis</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Total Bets</p>
                            <p className="text-lg font-bold">{gameAnalysis.totalBets || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-lg font-bold">{formatCurrency(gameAnalysis.totalAmount || 0)}</p>
                          </div>
                        </div>
                        
                        {gameAnalysis.colorBreakdown && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Color Breakdown</p>
                            <div className="space-y-2">
                              {Object.entries(gameAnalysis.colorBreakdown).map(([color, data]) => (
                                <div key={color} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getColorBadge(color)}`}></div>
                                    <span className="capitalize">{color}</span>
                                  </div>
                                  <div className="text-sm">
                                    {data.bets} bets • {formatCurrency(data.amount)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => toggleManipulation(selectedGame.id, !selectedGame.isManipulated)}
                      disabled={loading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        selectedGame.isManipulated
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      } disabled:opacity-50`}
                    >
                      {selectedGame.isManipulated ? (
                        <ToggleLeft className="w-4 h-4" />
                      ) : (
                        <ToggleRight className="w-4 h-4" />
                      )}
                      {selectedGame.isManipulated ? 'Disable' : 'Enable'} Manipulation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Manipulation;