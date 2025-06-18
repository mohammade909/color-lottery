"use client";
import React, { useEffect } from "react";
import useColorGameStore, { GameDuration } from "@/store/useColorGameStore";
import GameTimer from "./GameTimer";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { ColorGame } from "@/types";

const GameTabs: React.FC = () => {
  const { activeGames, selectedGame, selectGame, fetchActiveGames } =
    useColorGameStore();
  const { user, isAuthenticated } = useAuth();
  const { user: profile, getProfile } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      const userId = user?.id; // You'll need to implement this
      if (userId) {
        getProfile(userId);
      }
    }
  }, [isAuthenticated, user, getProfile]);
  // Initial fetch of active games if needed
  useEffect(() => {
    if (Object.keys(activeGames).length === 0) {
      fetchActiveGames();
    }
  }, [activeGames, fetchActiveGames]);

  const tabs = [
    { id: GameDuration.THIRTY_SECONDS, label: "30 Seconds" },
    { id: GameDuration.ONE_MINUTE, label: "1 Minute" },
    { id: GameDuration.THREE_MINUTES, label: "3 Minutes" },
    { id: GameDuration.FIVE_MINUTES, label: "5 Minutes" },
  ];

  const handleGameTimerFinish = () => {
    // Refresh games when a timer finishes
    fetchActiveGames();
    console.log(activeGames)
    // If the current game finished, potentially select another active game
    if (selectedGame) {
      const nextActiveGameKey = Object.keys(activeGames).find(
        (key) => key === selectedGame.duration && activeGames[key]
      );

      if (nextActiveGameKey) {
        selectGame(activeGames[nextActiveGameKey]);
      }
    }
  };

  const handleSelectGame = (duration: string) => {
    const game = activeGames[duration];
    if (game) {
      selectGame(game);
    }
  };

  return (
    <div className="w-full">
       <div className="mt-4">
         <div className="">
           <div className="grid grid-cols-4 sm:gap-3 gap-2 mb-4 w-full ">
             {tabs.map((tab) => {
               const isActive = selectedGame?.duration === tab.id;
               const game = activeGames[tab.id];
               return (
                 <button
                   key={tab.id}
                   onClick={() => handleSelectGame(tab.id)}
                   className={`relative  sm:min-w-0 rounded-xl sm:p-4 py-2 px-1 cursor-pointer text-center ${
                     isActive
                       ? "bg-gradient-to-br from-[#eac57d] to-[#ffbe00] text-[#783405] font-medium  text-[10px] sm:text-sm shadow-lg"
                       : "bg-[#373333] text-gray-200 hover:bg-[#373333]"
                   }`}
                   aria-current={isActive ? "page" : undefined}
                   disabled={!game}
                 >
                   <div className="text-2xl mb-1 sm:mb-2 flex justify-center">
                     <img
                       src={
                         isActive
                           ? "https://bdggame5.com/assets/png/time_a-07f92409.png"
                           : "https://bdggame5.com/assets/png/time-5d4e96a3.png"
                       }
                       alt="Time Icon"
                       className="sm:w-20 w-10"
                     />
                   </div>
                   <div className="sm:text-xs text-[10px] -mt-[4px] font-medium leading-tight whitespace-pre-line">
                     {tab.label}
                   </div>
                   {!game && (
                     <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                       <span className="text-xs text-gray-400">
                         Not Available
                       </span>
                     </div>
                   )}
                 </button>
               );
             })}
           </div>
         </div>
         {selectedGame && (
           <div className="mb-4">
             <GameTimer
               key={selectedGame.id || selectedGame.duration}
               endTime={selectedGame.end_time}
               game={selectedGame as ColorGame}
               onFinish={handleGameTimerFinish}
             />
           </div>
         )}
       </div>
     </div>
  );
};

export default GameTabs;

