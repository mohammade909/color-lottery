// 'use client'
// import React, { useState, useEffect } from 'react';
// import { 
//   Activity, 
//   TrendingUp, 
//   Users, 
//   DollarSign, 
//   Clock, 
//   Target,
//   BarChart3,
//   RefreshCw,
//   AlertCircle,
//   CheckCircle,
//   XCircle
// } from 'lucide-react';
// import { ActiveGame, ActivityStat, ApiResponse, RecentResult } from '@/types';
// import {GameTimer} from '@/components/GameTime';
// import axios from 'axios';
// // Types based on your service DTOs
// interface GameStatistics {
//   totalGames: number;
//   activeGames: number;
//   completedGames: number;
//   totalBets: number;
//   totalBetAmount: number;
//   totalWinAmount: number;
//   totalProfitLoss: number;
//   averageBetsPerGame: number;
//   popularBetTypes: Array<{
//     type: string;
//     count: number;
//     percentage: string;
//   }>;
//   winRateByBetType: Array<{
//     type: string;
//     totalBets: number;
//     winRate: string;
//   }>;
//   gamesByDuration: Array<{
//     duration: string;
//     count: number;
//     percentage: string;
//   }>;
//   recentActivity: {
//     last24Hours: ActivityStat;
//     last7Days: ActivityStat;
//   };
// }


// const AdminDashboard: React.FC = () => {
//   const [statistics, setStatistics] = useState<GameStatistics | null>(null);
//   const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
//   const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedDuration, setSelectedDuration] = useState<string>('all');
//   const [refreshing, setRefreshing] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');

//   // API Configuration - Update these with your actual endpoints
//   const API_BASE_URL =  'http://localhost:8800';
//   const WS_ENDPOINT = `${API_BASE_URL}/websocket`;
  
//   // Mock JWT token - In real app, get this from auth context/localStorage
//   const getAuthToken = () => {
//     return localStorage.getItem('authToken') || 'your-jwt-token-here';
//   };

//   const apiCall = async <T,>(endpoint: string): Promise<ApiResponse<T>> => {
//     const token = getAuthToken();
    
//     const response = await fetch(`${WS_ENDPOINT}${endpoint}`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return response.json();
//   };

//   const fetchStatistics = async () => {
//     try {
//       const response = await apiCall<GameStatistics>('/admin/statistics?days=7');
//       if (response.success && response.data) {
//         setStatistics(response.data);
//       } else {
//         throw new Error(response.message || 'Failed to fetch statistics');
//       }
//     } catch (err) {
//       console.error('Error fetching statistics:', err);
//       throw err;
//     }
//   };

//   const fetchActiveGames = async () => {
//     try {
//       const response = await apiCall<ActiveGame[]>('/admin/games/active');
//       if (response.success && response.data) {
//         setActiveGames(response.data);
//       } else {
//         throw new Error(response.message || 'Failed to fetch active games');
//       }
//     } catch (err) {
//       console.error('Error fetching active games:', err);
//       throw err;
//     }
//   };

//   const fetchRecentResults = async () => {
//     try {
//       const response = await apiCall<RecentResult[]>('/admin/results/recent?limit=10');
//       if (response.success && response.data) {
       
//         setRecentResults(response.data);
//       } else {
//         throw new Error(response.message || 'Failed to fetch recent results');
//       }
//     } catch (err) {
//       console.error('Error fetching recent results:', err);
//       throw err;
//     }
//   }; 

//   const checkWebSocketStatus = async () => {

//     try {
//       const response = await axios.get(`${WS_ENDPOINT}/check-status`);
      
//       if (response.data) {
//         console.log(response.data.status);
//         setConnectionStatus(response.data.status);
//       }
//     } catch (err) {
//       console.error('Error checking WebSocket status:', err);
//       setConnectionStatus('error');
//     }
//   };

//   const loadData = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       await Promise.all([
//         fetchStatistics(),
//         fetchActiveGames(),
//         fetchRecentResults(),
//         checkWebSocketStatus()
//       ]);
      
      
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await loadData();
//     setRefreshing(false);
//   };

//   const handleForceEndGames = async () => {
//     try {
//       const token = getAuthToken();
//       const response = await fetch(`${WS_ENDPOINT}/admin/games/force-end`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       const result = await response.json();
//       if (result.success) {
//         alert('All active games have been force ended');
//         await loadData(); // Refresh data
//       } else {
//         alert(`Error: ${result.message}`);
//       }
//     } catch (err) {
//       alert('Failed to force end games');
//     }
//   };

//   const broadcastMessage = async () => {
//     const message = prompt('Enter broadcast message:');
//     if (!message) return;

//     try {
//       const token = getAuthToken();
//       const response = await fetch(`${WS_ENDPOINT}/broadcast/message`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           content: message,
//           type: 'admin'
//         }),
//       });

//       const result = await response.json();
//       if (result.success) {
//         alert('Message broadcast successfully');
//       } else {
//         alert('Failed to broadcast message');
//       }
//     } catch (err) {
//       alert('Failed to broadcast message');
//     }
//   };

//   useEffect(() => {
//     loadData();
    
//     // Set up auto-refresh every 30 seconds
//     const interval = setInterval(() => {
//       if (!refreshing) {
//         loadData();
//       }
//     }, 30000);

//     return () => clearInterval(interval);
//   }, []);

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD'
//     }).format(amount);
//   };

//   const formatTimeRemaining = (endTime: string) => {
//     const now = new Date();
//     const end = new Date(endTime);
//     const diff = end.getTime() - now.getTime();
    
//     if (diff <= 0) return 'Ended';
    
//     const minutes = Math.floor(diff / 60000);
//     const seconds = Math.floor((diff % 60000) / 1000);
    
//     if (minutes > 0) {
//       return `${minutes}m ${seconds}s`;
//     }
//     return `${seconds}s`;
//   };



//   const getColorClass = (color: string) => {
//     switch (color.toLowerCase()) {
//       case 'red': return 'text-red-500 bg-red-100';
//       case 'green': return 'text-green-500 bg-green-100';
//       case 'black': return 'text-gray-800 bg-gray-100';
//       default: return 'text-gray-500 bg-gray-100';
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'active': return 'text-green-500';
//       case 'error': return 'text-red-500';
//       default: return 'text-yellow-500';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
//           <p className="text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
//           <p className="text-red-600 mb-4">{error}</p>
//           <button
//             onClick={loadData}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }
  

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//             <p className="text-gray-600 mt-2">Monitor game activities and statistics</p>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-2">
//               <div className={`w-3 h-3 rounded-full ${connectionStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
//               <span className={`text-sm font-medium ${getStatusColor(connectionStatus)}`}>
//                 {connectionStatus}
//               </span>
//             </div>
            
//             <button
//               onClick={handleRefresh}
//               disabled={refreshing}
//               className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
//             >
//               <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//               Refresh
//             </button>

//             <button
//               onClick={broadcastMessage}
//               className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
//             >
//               Broadcast
//             </button>

//             <button
//               onClick={handleForceEndGames}
//               className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//             >
//               Force End Games
//             </button>
//           </div>
//         </div>

//         {/* Statistics Cards */}
//         {statistics && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <div className="bg-white p-6 rounded-lg shadow">
//               <div className="flex items-center">
//                 <Activity className="w-8 h-8 text-blue-500" />
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Total Games</p>
//                   <p className="text-2xl font-bold text-gray-900">{statistics.totalGames.toLocaleString()}</p>
//                   <p className="text-xs text-green-600">Active: {statistics.activeGames}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow">
//               <div className="flex items-center">
//                 <Target className="w-8 h-8 text-green-500" />
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Total Bets</p>
//                   <p className="text-2xl font-bold text-gray-900">{statistics.totalBets.toLocaleString()}</p>
//                   <p className="text-xs text-gray-500">Avg: {statistics.averageBetsPerGame}/game</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow">
//               <div className="flex items-center">
//                 <DollarSign className="w-8 h-8 text-yellow-500" />
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Total Volume</p>
//                   <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.totalBetAmount)}</p>
//                   <p className="text-xs text-gray-500">Won: {formatCurrency(statistics.totalWinAmount)}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow">
//               <div className="flex items-center">
//                 <TrendingUp className="w-8 h-8 text-red-500" />
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Profit/Loss</p>
//                   <p className={`text-2xl font-bold ${statistics.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                     {formatCurrency(statistics.totalProfitLoss)}
//                   </p>
//                   <p className="text-xs text-gray-500">House edge</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           {/* Active Games */}
//           <div className="bg-white rounded-lg shadow">
//             <div className="p-6 border-b">
//               <h2 className="text-xl font-semibold text-gray-900">Active Games</h2>
//               <p className="text-gray-600">Currently running games</p>
//             </div>
//             <div className="p-6">
//               {activeGames.length === 0 ? (
//                 <p className="text-gray-500 text-center py-4">No active games</p>
//               ) : (
//                 <div className="space-y-4">
//                   {activeGames.map((game) => (
//                     <div key={game.id} className="border rounded-lg p-4">
//                       <div className="flex items-center justify-between mb-2">
//                         <div className="flex items-center space-x-2">
//                           <Clock className="w-4 h-4 text-blue-500" />
//                           <span className="font-medium">{game.duration} Game</span>
//                           <span className="text-sm text-gray-500">#{game.period}</span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <span className="text-sm font-medium text-orange-600">
//                             <GameTimer endTime={game.end_time} />
//                           </span>
//                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                         </div>
//                       </div>
//                       <div className="flex justify-between text-sm text-gray-600">
//                         <span>Bets: {game.total_bets}</span>
//                         <span>Volume: {formatCurrency(game.total_bet_amount)}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Recent Results */}
//           <div className="bg-white rounded-lg shadow">
//             <div className="p-6 border-b">
//               <h2 className="text-xl font-semibold text-gray-900">Recent Results</h2>
//               <p className="text-gray-600">Latest game outcomes</p>
//             </div>
//             <div className="p-6">
//               {recentResults.length === 0 ? (
//                 <p className="text-gray-500 text-center py-4">No recent results</p>
//               ) : (
//                 <div className="space-y-3">
//                   {recentResults.map((result) => (
//                     <div key={result.id} className="flex items-center justify-between p-3 border rounded">
//                       <div className="flex items-center space-x-3">
//                         <div className="text-2xl font-bold text-gray-900">
//                           {result.number}
//                         </div>
//                         <div className="flex space-x-2">
//                           <span className={`px-2 py-1 rounded text-xs font-medium ${getColorClass(result.color)}`}>
//                             {result.color.toUpperCase()}
//                           </span>
//                           <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                             {result.size.toUpperCase()}
//                           </span>
//                           <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                             {result.game.duration}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="text-right text-sm text-gray-500">
//                         {new Date(result.timestamp).toLocaleTimeString()}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Statistics Charts */}
//         {statistics && (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Popular Bet Types */}
//             <div className="bg-white rounded-lg shadow">
//               <div className="p-6 border-b">
//                 <h2 className="text-xl font-semibold text-gray-900">Popular Bet Types</h2>
//               </div>
//               <div className="p-6">
//                 <div className="space-y-4">
//                   {statistics.popularBetTypes.map((bet) => (
//                     <div key={bet.type} className="flex items-center justify-between">
//                       <div>
//                         <span className="font-medium">{bet.type}</span>
//                         <div className="text-sm text-gray-500">{bet.count.toLocaleString()} bets</div>
//                       </div>
//                       <div className="text-right">
//                         <div className="font-semibold">{bet.percentage}</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Win Rates */}
//             <div className="bg-white rounded-lg shadow">
//               <div className="p-6 border-b">
//                 <h2 className="text-xl font-semibold text-gray-900">Win Rates</h2>
//               </div>
//               <div className="p-6">
//                 <div className="space-y-4">
//                   {statistics.winRateByBetType.map((bet) => (
//                     <div key={bet.type} className="flex items-center justify-between">
//                       <div>
//                         <span className="font-medium">{bet.type}</span>
//                         <div className="text-sm text-gray-500">{bet.totalBets.toLocaleString()} bets</div>
//                       </div>
//                       <div className="text-right">
//                         <div className="font-semibold">{bet.winRate}</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Recent Activity */}
//             <div className="bg-white rounded-lg shadow">
//               <div className="p-6 border-b">
//                 <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
//               </div>
//               <div className="p-6">
//                 <div className="space-y-6">
//                   <div>
//                     <h3 className="font-medium text-gray-900 mb-2">Last 24 Hours</h3>
//                     <div className="space-y-1 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Games:</span>
//                         <span className="font-medium">{statistics.recentActivity.last24Hours.games}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Bets:</span>
//                         <span className="font-medium">{statistics.recentActivity.last24Hours.bets.toLocaleString()}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Volume:</span>
//                         <span className="font-medium">{formatCurrency(statistics.recentActivity.last24Hours.betAmount)}</span>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div>
//                     <h3 className="font-medium text-gray-900 mb-2">Last 7 Days</h3>
//                     <div className="space-y-1 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Games:</span>
//                         <span className="font-medium">{statistics.recentActivity.last7Days.games}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Bets:</span>
//                         <span className="font-medium">{statistics.recentActivity.last7Days.bets.toLocaleString()}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Volume:</span>
//                         <span className="font-medium">{formatCurrency(statistics.recentActivity.last7Days.betAmount)}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;



// src/pages/admin/dashboard.tsx

'use client'
import React from 'react';
import Header from '@/components/ui/Header';
import { LoadingSpinner, ErrorDisplay } from '@/components/ui/LoadingSpinner';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import ActiveGames from '@/components/dashboard/ActiveGames';
import RecentResults from '@/components/dashboard/RecentResults';
import PopularBetTypes from '@/components/dashboard/PopularBetTypes';
import WinRates from '@/components/dashboard/WinRates';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardLayout from '@/components/Layout/DashboardLayout';

const AdminDashboard: React.FC = () => {
  const {
    statistics,
    activeGames,
    recentResults,
    loading,
    error,
    connectionStatus,
    refreshing,
    handleRefresh,
    handleForceEndGames,
    broadcastMessage,
  } = useDashboardData();

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRefresh} />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header
          title="Admin Dashboard"
          subtitle="Monitor game activities and statistics"
          connectionStatus={connectionStatus}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onBroadcast={broadcastMessage}
          onForceEndGames={handleForceEndGames}
        />

        {/* Statistics Cards */}
        {statistics && <StatisticsCards statistics={statistics} />}

        {/* Active Games and Recent Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ActiveGames activeGames={activeGames} />
          <RecentResults recentResults={recentResults} />
        </div>

        {/* Statistics Charts */}
        {statistics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <PopularBetTypes statistics={statistics} />
            <WinRates statistics={statistics} />
            <RecentActivity statistics={statistics} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;