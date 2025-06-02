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

  // Initial setup - socket connections
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     // connectSocket(token);
  //     setupSocketListeners();
  //   }
  // }, [setupSocketListeners]);

  // Fetch results when selectedGame changes
  useEffect(() => {
    if (selectedGame?.duration) {
      fetchGameResults(selectedGame.duration);
    }
  }, [selectedGame?.id, fetchGameResults]); // Use selectedGame.id instead of duration to avoid extra calls

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <BetOptions />
          <BetForm />
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <ResultsHistory />
        </div>
      </div>
    </>
  );
};

export default Game;