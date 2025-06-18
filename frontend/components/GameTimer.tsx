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
  const [key, setKey] = useState<string>(endTime);
  const [showModal, setShowModal] = useState<boolean>(false);

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

      // Show modal when 10 seconds or less
      if (remaining <= 10 && remaining > 0) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }

      if (remaining <= 0 && onFinish) {
        onFinish();
        clearInterval(timer);
        setShowModal(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onFinish, key]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Format minutes and seconds with padding
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  const colorNumbers = [
    { number: 5, color: "bg-green-500" },
    { number: 0, color: "bg-purple-500" },
    { number: 2, color: "bg-pink-500" },
    { number: 8, color: "bg-pink-400" },
    { number: 7, color: "bg-green-500" },
  ];

  return (
    <>
      <div
        className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-4 text-black"
        style={{
          backgroundImage:
            "url('https://bdggame5.com/assets/png/wingoissue-ba51f474.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <button className="flex items-center text-[#352302] gap-2 text-sm font-medium bg-yellow-600 px-3 py-1 rounded-full">
            <span className="text-xs text-[#533703]">
              <svg data-v-3cbad787="" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 36 36" fill="none">
                <path data-v-3cbad787="" d="M23.67 3H12.33C6.66 3 5.25 4.515 5.25 10.56V27.45C5.25 31.44 7.44 32.385 10.095 29.535L10.11 29.52C11.34 28.215 13.215 28.32 14.28 29.745L15.795 31.77C17.01 33.375 18.975 33.375 20.19 31.77L21.705 29.745C22.785 28.305 24.66 28.2 25.89 29.52C28.56 32.37 30.735 31.425 30.735 27.435V10.56C30.75 4.515 29.34 3 23.67 3ZM11.67 18C10.845 18 10.17 17.325 10.17 16.5C10.17 15.675 10.845 15 11.67 15C12.495 15 13.17 15.675 13.17 16.5C13.17 17.325 12.495 18 11.67 18ZM11.67 12C10.845 12 10.17 11.325 10.17 10.5C10.17 9.675 10.845 9 11.67 9C12.495 9 13.17 9.675 13.17 10.5C13.17 11.325 12.495 12 11.67 12ZM24.345 17.625H16.095C15.48 17.625 14.97 17.115 14.97 16.5C14.97 15.885 15.48 15.375 16.095 15.375H24.345C24.96 15.375 25.47 15.885 25.47 16.5C25.47 17.115 24.96 17.625 24.345 17.625ZM24.345 11.625H16.095C15.48 11.625 14.97 11.115 14.97 10.5C14.97 9.885 15.48 9.375 16.095 9.375H24.345C24.96 9.375 25.47 9.885 25.47 10.5C25.47 11.115 24.96 11.625 24.345 11.625Z" fill="currentColor"></path>
              </svg>
            </span>
            How to play
          </button>
          <div className="text-right">
            <div className="text-sm font-medium">
              {timeLeft === 0 ? "Time expired" : "Time remaining"}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="sm:text-lg font-semibold text-base sm:mb-0 mb-5">Win 30sec</div>
            <div className="flex justify-center gap-1 mt-3">
              {colorNumbers.map((item, index) => (
                <div
                  key={index}
                  className={`sm:w-8 sm:h-8 w-5 h-5 rounded-full ${item.color} text-white flex items-center justify-center font-bold text-sm shadow-lg`}
                >
                  {item.number}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-end gap-1 text-sm sm:text-2xl sm:font-semibold">
              <span className="bg-black text-yellow-400 px-2 py-1 rounded sm:min-w-[32px] min-w-[25px] text-center font-mono">
                {formattedMinutes[0]}
              </span>
              <span className="bg-black text-yellow-400 px-2 py-1 rounded sm:min-w-[32px] min-w-[25px] text-center font-mono">
                {formattedMinutes[1]}
              </span>
              <span className="text-black">:</span>
              <span className="bg-black text-yellow-400 px-2 py-1 rounded sm:min-w-[32px] min-w-[25px] text-center font-mono">
                {formattedSeconds[0]}
              </span>
              <span className="bg-black text-yellow-400 px-2 py-1 rounded sm:min-w-[32px] min-w-[25px] text-center font-mono">
                {formattedSeconds[1]}
              </span>
            </div>
            <div className="text-right mt-4">
              <div className="sm:text-sm text-xs font-medium text-[#291a00] bg-opacity-20 py-1 rounded-full inline-block">
                {game.period}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for last 10 seconds */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-4">
              Time Running Out!
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-3 rounded-lg text-4xl font-bold font-mono shadow-2xl border-2 border-yellow-300">
                {formattedSeconds[0]}
              </span>
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-3 rounded-lg text-4xl font-bold font-mono shadow-2xl border-2 border-yellow-300">
                {formattedSeconds[1]}
              </span>
            </div>
            <div className="text-yellow-400 text-lg mt-4 font-semibold">
              seconds left
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameTimer;