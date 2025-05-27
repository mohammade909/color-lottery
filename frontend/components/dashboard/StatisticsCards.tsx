// src/components/dashboard/StatisticsCards.tsx
import React from 'react';
import { Activity, TrendingUp, Target, DollarSign } from 'lucide-react';
import { GameStatistics } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface StatisticsCardsProps {
  statistics: GameStatistics;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics }) => {
  const cards = [
    {
      title: 'Total Games',
      value: statistics.totalGames.toLocaleString(),
      subtext: `Active: ${statistics.activeGames}`,
      icon: Activity,
      iconColor: 'text-blue-500',
      subtextColor: 'text-green-600'
    },
    {
      title: 'Total Bets',
      value: statistics.totalBets.toLocaleString(),
      subtext: `Avg: ${statistics.averageBetsPerGame}/game`,
      icon: Target,
      iconColor: 'text-green-500',
      subtextColor: 'text-gray-500'
    },
    {
      title: 'Total Volume',
      value: formatCurrency(statistics.totalBetAmount),
      subtext: `Won: ${formatCurrency(statistics.totalWinAmount)}`,
      icon: DollarSign,
      iconColor: 'text-yellow-500',
      subtextColor: 'text-gray-500'
    },
    {
      title: 'Profit/Loss',
      value: formatCurrency(statistics.totalProfitLoss),
      subtext: 'House edge',
      icon: TrendingUp,
      iconColor: 'text-red-500',
      valueColor: statistics.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600',
      subtextColor: 'text-gray-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Icon className={`w-8 h-8 ${card.iconColor}`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.valueColor || 'text-gray-900'}`}>
                  {card.value}
                </p>
                <p className={`text-xs ${card.subtextColor}`}>
                  {card.subtext}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatisticsCards;