// src/components/dashboard/GameTimer.tsx
import React, { useState, useEffect } from 'react';
import { formatTimeRemaining } from '@/utils/formatters';

interface GameTimerProps {
  endTime: string;
}

export const GameTimer: React.FC<GameTimerProps> = ({ endTime }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(endTime));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return <span>{timeRemaining}</span>;
};