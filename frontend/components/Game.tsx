"use client";
import React from "react";
import { useEffect } from "react";
import BetOptions from "@/components/BetOptions";
import BetForm from "@/components/BetForm";
import ResultsHistory from "@/components/ResultsHistory";

import useColorGameStore, { GameDuration } from "@/store/useColorGameStore";

const Game = () => {
  const { fetchGameResults, selectedGame, setupSocketListeners } =
    useColorGameStore();
  useEffect(() => {
    if (selectedGame?.duration) {
      fetchGameResults(selectedGame.duration);
    }
  }, [selectedGame?.id, fetchGameResults]); // Use selectedGame.id instead of duration to avoid extra calls

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 shadow-md rounded-lg p-4">
          <BetOptions />
          <BetForm />
        </div>

        <div className="bg-gray-800 shadow-md rounded-lg md:p-4 text-white">
          <ResultsHistory />
        </div>
      </div>
    </>
  );
};

export default Game;
