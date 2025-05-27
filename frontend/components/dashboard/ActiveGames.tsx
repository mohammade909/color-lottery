// src/components/dashboard/ActiveGames.tsx
import React from 'react';
import { Clock } from 'lucide-react';
import { ActiveGame } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';
import { GameTimer } from './GameTimer';

interface ActiveGamesProps {
  activeGames: ActiveGame[];
}

const ActiveGames: React.FC<ActiveGamesProps> = ({ activeGames }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Active Games</h2>
        <p className="text-gray-600">Currently running games</p>
      </div>
      <div className="p-6">
        {activeGames.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No active games</p>
        ) : (
          <div className="space-y-4">
            {activeGames.map((game) => (
              <div key={game.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{game.duration} Game</span>
                    <span className="text-sm text-gray-500">#{game.period}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-orange-600">
                      <GameTimer endTime={game.end_time} />
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Bets: {game.total_bets}</span>
                  <span>Volume: {formatCurrency(game.total_bet_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveGames;