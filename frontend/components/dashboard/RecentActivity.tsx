// src/components/dashboard/RecentActivity.tsx
import React from 'react';
import { GameStatistics } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface RecentActivityProps {
  statistics: GameStatistics;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ statistics }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Last 24 Hours</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Games:</span>
                <span className="font-medium">{statistics.recentActivity.last24Hours.games}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bets:</span>
                <span className="font-medium">{statistics.recentActivity.last24Hours.bets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volume:</span>
                <span className="font-medium">{formatCurrency(statistics.recentActivity.last24Hours.betAmount)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Last 7 Days</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Games:</span>
                <span className="font-medium">{statistics.recentActivity.last7Days.games}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bets:</span>
                <span className="font-medium">{statistics.recentActivity.last7Days.bets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volume:</span>
                <span className="font-medium">{formatCurrency(statistics.recentActivity.last7Days.betAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;