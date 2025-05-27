import React, { useState, useEffect } from 'react';
import { useGame } from '../context/gameContext'
import { ColorGame, GameResult, BetType, ColorValue, SizeValue, MULTIPLIERS } from '../types';

interface GameCardProps {
  game: ColorGame;
  result?: GameResult;
  onPlaceBet?: (betType: BetType, betValue: string, amount: number) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, result, onPlaceBet }) => {
  const { getFormattedTimeRemaining } = useGame();
  const [timeRemaining, setTimeRemaining] = useState<string>(getFormattedTimeRemaining(game));
  const [selectedBetType, setSelectedBetType] = useState<BetType>(BetType.COLOR);
  const [selectedBetValue, setSelectedBetValue] = useState<string>(ColorValue.RED);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isGameEnded, setIsGameEnded] = useState<boolean>(false);
  
  // Update time remaining
  useEffect(() => {
    const timer = setInterval(() => {
      const formattedTime = getFormattedTimeRemaining(game);
      setTimeRemaining(formattedTime);
      
      if (formattedTime === '00:00') {
        setIsGameEnded(true);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [game, getFormattedTimeRemaining]);
  
  // Handle bet submission
  const handlePlaceBet = () => {
    if (onPlaceBet && !isGameEnded) {
      onPlaceBet(selectedBetType, selectedBetValue, betAmount);
    }
  };
  
  // Calculate potential win amount
  const calculatePotentialWin = () => {
    const multiplier =  1;
    return betAmount * multiplier;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Game {game.period} ({game.duration})
        </h3>
        <div className={`text-xl font-bold ${timeRemaining === '00:00' ? 'text-red-500' : 'text-green-500'}`}>
          {timeRemaining}
        </div>
      </div>
      
      {/* Game stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Total Bets</p>
          <p className="font-semibold">{game.total_bets}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="font-semibold">{game.total_bet_amount}</p>
        </div>
      </div>
      
      {/* Result display if game ended */}
      {result && (
        <div className="bg-gray-100 p-3 rounded-md mb-4">
          <h4 className="font-medium mb-2">Result</h4>
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white
              ${result.color === ColorValue.RED ? 'bg-red-500' : 
                result.color === ColorValue.GREEN ? 'bg-green-500' : 'bg-black'}`}>
              {result.number}
            </div>
            <div>
              <span className="mr-2">Color: {result.color}</span>
              <span>Size: {result.size}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Betting interface if game is active */}
      {!isGameEnded && !result && (
        <>
          {/* Bet Type Selection */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Bet Type</p>
            <div className="flex gap-2">
              {Object.values(BetType).map((type) => (
                <button
                  key={type}
                  className={`px-3 py-1 rounded ${
                    selectedBetType === type 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedBetType(type);
                    // Reset bet value when changing type
                    if (type === BetType.COLOR) setSelectedBetValue(ColorValue.RED);
                    else if (type === BetType.NUMBER) setSelectedBetValue('0');
                    else if (type === BetType.SIZE) setSelectedBetValue(SizeValue.BIG);
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Bet Value Selection */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Select {selectedBetType}</p>
            <div className="grid grid-cols-5 gap-2">
              {selectedBetType === BetType.COLOR && (
                Object.values(ColorValue).map((color) => (
                  <button
                    key={color}
                    className={`px-3 py-2 rounded-md 
                      ${color === ColorValue.RED ? 'bg-red-500 text-white' : 
                        color === ColorValue.GREEN ? 'bg-green-500 text-white' : 
                        'bg-black text-white'} 
                      ${selectedBetValue === color ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedBetValue(color)}
                  >
                    {color}
                  </button>
                ))
              )}
              
              {selectedBetType === BetType.NUMBER && (
                Array.from({ length: 10 }, (_, i) => i.toString()).map((num) => (
                  <button
                    key={num}
                    className={`px-3 py-2 rounded-md bg-gray-200
                      ${selectedBetValue === num ? 'ring-2 ring-blue-500 bg-blue-100' : ''}`}
                    onClick={() => setSelectedBetValue(num)}
                  >
                    {num}
                  </button>
                ))
              )}
              
              {selectedBetType === BetType.SIZE && (
                Object.values(SizeValue).map((size) => (
                  <button
                    key={size}
                    className={`px-3 py-2 rounded-md bg-gray-200
                      ${selectedBetValue === size ? 'ring-2 ring-blue-500 bg-blue-100' : ''}`}
                    onClick={() => setSelectedBetValue(size)}
                  >
                    {size}
                  </button>
                ))
              )}
            </div>
          </div>
          
          {/* Bet Amount */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Bet Amount</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border rounded-md px-3 py-2"
              />
              <div className="flex gap-1">
                {[5, 10, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    className="px-2 py-1 bg-gray-200 rounded text-sm"
                    onClick={() => setBetAmount(amount)}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Potential Win */}
          <div className="mb-4 p-2 bg-blue-50 rounded-md">
            <p className="text-sm text-gray-600">Potential Win</p>
            <p className="font-semibold text-green-600">
              {calculatePotentialWin()}
            </p>
          </div>
          
          {/* Place Bet Button */}
          <button
            onClick={handlePlaceBet}
            disabled={isGameEnded}
            className={`w-full py-2 rounded-md ${
              isGameEnded 
                ? 'bg-gray-300 text-gray-500' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Place Bet
          </button>
        </>
      )}
    </div>
  );
};

export default GameCard;