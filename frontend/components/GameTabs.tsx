"use client";
import React, { useEffect } from "react";
import useColorGameStore, { GameDuration } from "@/store/useColorGameStore";
import GameTimer from "./GameTimer";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { ColorGame } from "@/types";
import Wallet from "./Wallet";
 
const GameTabs: React.FC = () => {
  const { activeGames, selectedGame, selectGame, fetchActiveGames, handleRefresh } =
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
    handleRefresh()

    // If the current game finished, potentially select another active game
    if (selectedGame) {
      const nextActiveGameKey = Object.keys(activeGames).find(
        (key) => key !== selectedGame.duration && activeGames[key]
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
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = selectedGame?.duration === tab.id;
            const game = activeGames[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => handleSelectGame(tab.id)}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                aria-current={isActive ? "page" : undefined}
                disabled={!game} // Disable button if no active game for this duration
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {selectedGame && (
        <div className="mt-4">
          {/* Key prop ensures re-render when game changes */}
          <GameTimer
            key={selectedGame.id || selectedGame.duration}
            endTime={selectedGame.end_time}
            game={selectedGame as ColorGame}
            onFinish={handleGameTimerFinish}
          />

          <Wallet />
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-gray-600">Total Bets</div>
              <div className="font-bold text-xl">{selectedGame.total_bets}</div>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-gray-600">Balance</div>
              <div className="font-bold text-xl">₹{profile?.wallet}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTabs;
