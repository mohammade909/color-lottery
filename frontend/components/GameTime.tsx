'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

// Types

interface GameTimerProps {
  endTime: string | Date;
}

// Timer component for individual games
export const GameTimer: React.FC<GameTimerProps> = ({ endTime }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const updateTimer = (): void => {
      const now = new Date().getTime();
      const endTimeMs = new Date(endTime).getTime();
      const difference = endTimeMs - now;

      if (difference <= 0) {
        setTimeRemaining('00:00');
        setIsExpired(true);
        return;
      }

      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeRemaining(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      setIsExpired(false);
    };

    // Update immediately
    updateTimer();
    
    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
      {timeRemaining}
    </span>
  );
};
