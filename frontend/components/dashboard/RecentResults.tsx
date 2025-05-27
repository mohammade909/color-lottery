// src/components/dashboard/RecentResults.tsx
import React from 'react';
import { RecentResult } from '@/types/dashboard';
import { getColorClass } from '@/utils/formatters';

interface RecentResultsProps {
  recentResults: RecentResult[];
}

const RecentResults: React.FC<RecentResultsProps> = ({ recentResults }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Recent Results</h2>
        <p className="text-gray-600">Latest game outcomes</p>
      </div>
      <div className="p-6">
        {recentResults.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent results</p>
        ) : (
          <div className="space-y-3">
            {recentResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {result.number}
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getColorClass(result.color)}`}>
                      {result.color.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {result.size.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {result.game.duration}
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentResults;