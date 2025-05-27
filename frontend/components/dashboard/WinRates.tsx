// src/components/dashboard/WinRates.tsx
import React from 'react';
import { GameStatistics } from '@/types/dashboard';

interface WinRatesProps {
  statistics: GameStatistics;
}

const WinRates: React.FC<WinRatesProps> = ({ statistics }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Win Rates</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {statistics.winRateByBetType.map((bet) => (
            <div key={bet.type} className="flex items-center justify-between">
              <div>
                <span className="font-medium">{bet.type}</span>
                <div className="text-sm text-gray-500">{bet.totalBets.toLocaleString()} bets</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{bet.winRate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WinRates;