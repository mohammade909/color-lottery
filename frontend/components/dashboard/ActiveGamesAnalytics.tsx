import React, { useState, useEffect } from 'react';

interface NumberBets {
  [key: string]: number;
}

interface ColorBets {
  red: number;
  green: number;
  black: number;
}

interface SizeBets {
  small: number;
  big: number;
}

interface Analysis {
  numberBets: NumberBets;
  colorBets: ColorBets;
  sizeBets: SizeBets;
  totalBetAmount: number;
  mostBetNumber: number;
  mostBetColor: string;
  mostBetSize: string;
}

interface GameData {
  gameId: string;
  duration: string;
  period: string;
  endTime: string;
  totalBets: number;
  analysis: Analysis;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: GameData[];
  count: number;
}

const ActiveGamesAnalytics: React.FC = () => {
  const [data, setData] = useState<GameData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8800/color-game/analytics/active-games');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: ApiResponse = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getColorBadgeClass = (color: string) => {
    switch (color.toLowerCase()) {
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'black':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Active Games Analytics</h1>
          <p className="text-gray-600 mt-2">Real-time betting statistics and analysis</p>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No active games found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {data.map((game) => (
              <div key={game.gameId} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Game Header */}
                <div className="bg-blue-600 text-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Game ID: {game.gameId.slice(0, 8)}...</h2>
                      <p className="text-blue-100">Duration: {game.duration} | Period: {game.period}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{game.totalBets} Total Bets</p>
                      <p className="text-blue-100">Ends: {formatDateTime(game.endTime)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Summary Cards */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Total Bet Amount</h3>
                    <p className="text-2xl font-bold text-green-900">${game.analysis.totalBetAmount}</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-800 mb-2">Most Bet Number</h3>
                    <p className="text-2xl font-bold text-purple-900">{game.analysis.mostBetNumber}</p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">Most Bet Size</h3>
                    <p className="text-2xl font-bold text-orange-900 capitalize">{game.analysis.mostBetSize}</p>
                  </div>

                  {/* Number Bets */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Number Bets Distribution</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(game.analysis.numberBets).map(([number, percentage]) => (
                        <div key={number} className="text-center">
                          <div className="bg-blue-100 rounded-lg p-2 mb-1">
                            <span className="font-semibold text-blue-800">{number}</span>
                          </div>
                          <span className="text-xs text-gray-600">{percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color Bets */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Color Bets Distribution</h3>
                    <div className="space-y-3">
                      {Object.entries(game.analysis.colorBets).map(([color, percentage]) => (
                        <div key={color} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className={`inline-block w-4 h-4 rounded-full mr-2 ${
                              color === 'red' ? 'bg-red-500' : 
                              color === 'green' ? 'bg-green-500' : 
                              'bg-gray-800'
                            }`}></span>
                            <span className="capitalize font-medium text-gray-700">{color}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  color === 'red' ? 'bg-red-500' : 
                                  color === 'green' ? 'bg-green-500' : 
                                  'bg-gray-800'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-600">{percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Size Bets */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Size Bets Distribution</h3>
                    <div className="space-y-3">
                      {Object.entries(game.analysis.sizeBets).map(([size, percentage]) => (
                        <div key={size} className="flex items-center justify-between">
                          <span className="capitalize font-medium text-gray-700">{size}</span>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="h-2 rounded-full bg-indigo-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-600">{percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Most Bet Color Badge */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Most Bet Color</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorBadgeClass(game.analysis.mostBetColor)}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          game.analysis.mostBetColor === 'red' ? 'bg-red-500' : 
                          game.analysis.mostBetColor === 'green' ? 'bg-green-500' : 
                          'bg-gray-800'
                        }`}></span>
                        {game.analysis.mostBetColor.charAt(0).toUpperCase() + game.analysis.mostBetColor.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveGamesAnalytics;