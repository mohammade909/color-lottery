"use client";
import { ColorGame } from "@/types";
import React, { useEffect, useState } from "react";

interface GameTimerProps {
  endTime: string;
  game: ColorGame;
  onFinish?: () => void;
}

const GameTimer: React.FC<GameTimerProps> = ({ endTime, onFinish, game }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [key, setKey] = useState<string>(endTime); // Add a key state that changes with endTime

  // Reset the timer when endTime changes
  useEffect(() => {
    setKey(endTime);
  }, [endTime]);

  useEffect(() => {
    // Calculate time left function without using date-fns
    const calculateTimeLeft = () => {
      const endTimeDate = new Date(endTime);
      const now = new Date();
      const diffInSeconds = Math.floor(
        (endTimeDate.getTime() - now.getTime()) / 1000
      );
      return diffInSeconds > 0 ? diffInSeconds : 0;
    };

    // Initialize time left
    setTimeLeft(calculateTimeLeft());

    // Set up interval for countdown
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0 && onFinish) {
        onFinish();
        clearInterval(timer);
      }
    }, 1000);

    // Clean up interval on unmount or when endTime changes
    return () => clearInterval(timer);
  }, [endTime, onFinish, key]); // Added key to dependencies to force re-render

  // Format seconds to MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl font-bold text-blue-600 font-mono">
          {formattedTime}
        </div>
        <div className="text-3xl font-bold text-green-600 font-mono">
          GAME ID : {game.period}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {timeLeft === 0 ? "Time expired" : "Time remaining"}
        </div>
      </div>
    </div>
  );
};

export default GameTimer;
