// src/components/ui/Header.tsx
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { getStatusColor } from '@/utils/formatters';

interface HeaderProps {
  title: string;
  subtitle: string;
  connectionStatus: string;
  refreshing: boolean;
  onRefresh: () => void;
  onBroadcast: () => void;
  onForceEndGames: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  connectionStatus,
  refreshing,
  onRefresh,
  onBroadcast,
  onForceEndGames,
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-2">{subtitle}</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${connectionStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${getStatusColor(connectionStatus)}`}>
            {connectionStatus}
          </span>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>

        <button
          onClick={onBroadcast}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Broadcast
        </button>

        <button
          onClick={onForceEndGames}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Force End Games
        </button>
      </div>
    </div>
  );
};

export default Header;