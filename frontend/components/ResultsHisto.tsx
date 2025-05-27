import React from 'react';
import { GameResult, ColorValue } from '../types';

interface ResultsHistoryProps {
  results: GameResult[];
}

// Helper function to get color class
const getColorClass = (color: string): string => {
  switch (color) {
    case ColorValue.RED:
      return 'bg-red-500';
    case ColorValue.GREEN:
      return 'bg-green-500';
    case ColorValue.BLACK:
      return 'bg-black';
    default:
      return 'bg-gray-500';
  }
};

// Helper function to generate stats
const generateStats = (results: GameResult[]) => {
  if (!results.length) return null;
  
  const colorCount = {
    [ColorValue.RED]: 0,
    [ColorValue.GREEN]: 0,
    [ColorValue.BLACK]: 0
  };
  
  const sizeCount = {
    big: 0,
    small: 0
  };
  
  const numberCount: Record<string, number> = {};
  
  results.forEach(result => {
    // Count colors
    colorCount[result.color]++;
    
    // Count sizes
    sizeCount[result.size]++;
    
    // Count numbers
    const numStr = result.number.toString();
    numberCount[numStr] = (numberCount[numStr] || 0) + 1;
  });
  
  // Find hot numbers (highest frequency)
  const hotNumbers = Object.entries(numberCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([num, count]) => ({ number: parseInt(num), count }));
  
  // Find cold numbers (lowest frequency)
  const coldNumbers = Object.entries(numberCount)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([num, count]) => ({ number: parseInt(num), count }));
  
  return {
    colorCount,
    sizeCount,
    hotNumbers,
    coldNumbers
  };
};

const ResultsHistory: React.FC<ResultsHistoryProps> = ({ results }) => {
  const stats = generateStats(results);
  
  // Pattern detection
  const lastFiveResults = results.slice(0, 5);
  const hasRedStreak = lastFiveResults.length >= 3 && 
    lastFiveResults.slice(0, 3).every(r => r.color === ColorValue.RED);
  const hasBlackStreak = lastFiveResults.length >= 3 && 
    lastFiveResults.slice(0, 3).every(r => r.color === ColorValue.BLACK);
  const hasBigStreak = lastFiveResults.length >= 3 && 
    lastFiveResults.slice(0, 3).every(r => r.size === 'big');
  const hasSmallStreak = lastFiveResults.length >= 3 && 
    lastFiveResults.slice(0, 3).every(r => r.size === 'small');
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Game History & Stats</h2>
      
      {/* Latest Results */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Latest Results</h3>
        <div className="flex flex-wrap gap-2">
          {results.slice(0, 20).map((result, index) => (
            <div 
              key={`${result.period_id}-${index}`}
              className={`w-10 h-10 rounded-full ${getColorClass(result.color)} flex items-center justify-center text-white font-medium`}
              title={`Number: ${result.number}, Color: ${result.color}, Size: ${result.size}`}
            >
              {result.number}
            </div>
          ))}
          
          {results.length === 0 && (
            <p className="text-gray-500">No results available</p>
          )}
        </div>
      </div>
      
      {/* Statistics */}
      {stats && (
        <>
          {/* Color Distribution */}
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">Color Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-100 p-3 rounded text-center">
                <div className="text-red-600 font-bold text-xl">{stats.colorCount[ColorValue.RED]}</div>
                <div className="text-sm">Red</div>
              </div>
              <div className="bg-green-100 p-3 rounded text-center">
                <div className="text-green-600 font-bold text-xl">{stats.colorCount[ColorValue.GREEN]}</div>
                <div className="text-sm">Green</div>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-white font-bold text-xl">{stats.colorCount[ColorValue.BLACK]}</div>
                <div className="text-white text-sm">Black</div>
              </div>
            </div>
          </div>
          
          {/* Size Distribution */}
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">Size Distribution</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-100 p-3 rounded text-center">
                <div className="text-blue-600 font-bold text-xl">{stats.sizeCount.big}</div>
                <div className="text-sm">Big (5-9)</div>
              </div>
              <div className="bg-yellow-100 p-3 rounded text-center">
                <div className="text-yellow-600 font-bold text-xl">{stats.sizeCount.small}</div>
                <div className="text-sm">Small (0-4)</div>
              </div>
            </div>
          </div>
          
          {/* Hot & Cold Numbers */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-md font-medium mb-2">Hot Numbers</h3>
              <div className="flex gap-2">
                {stats.hotNumbers.map(item => (
                  <div key={`hot-${item.number}`} className="bg-red-100 px-3 py-2 rounded text-center">
                    <div className="text-red-600 font-bold">{item.number}</div>
                    <div className="text-xs text-gray-600">{item.count}x</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium mb-2">Cold Numbers</h3>
              <div className="flex gap-2">
                {stats.coldNumbers.map(item => (
                  <div key={`cold-${item.number}`} className="bg-blue-100 px-3 py-2 rounded text-center">
                    <div className="text-blue-600 font-bold">{item.number}</div>
                    <div className="text-xs text-gray-600">{item.count}x</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Pattern Alerts */}
          {(hasRedStreak || hasBlackStreak || hasBigStreak || hasSmallStreak) && (
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-4">
              <h3 className="text-md font-medium mb-1">Pattern Alerts</h3>
              <ul className="text-sm">
                {hasRedStreak && <li>• Red streak detected (3+ consecutive reds)</li>}
                {hasBlackStreak && <li>• Black streak detected (3+ consecutive blacks)</li>}
                {hasBigStreak && <li>• Big numbers streak detected (3+ consecutive big numbers)</li>}
                {hasSmallStreak && <li>• Small numbers streak detected (3+ consecutive small numbers)</li>}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultsHistory;