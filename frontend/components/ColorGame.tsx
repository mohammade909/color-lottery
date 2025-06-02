"use client";
import React from "react";
import { useEffect } from "react";
import GameTabs from "@/components/GameTabs";

import UserBets from "@/components/UserBets";
import useColorGameStore from "@/store/useColorGameStore";
import Game from "@/components/Game";
import Wallet from "@/components/Wallet";
const ColorGame = () => {
  const { fetchUserBets, setupSocketListeners } = useColorGameStore();

  useEffect(() => {
    fetchUserBets();

    // Setup socket connections
    const token = localStorage.getItem("token");
    if (token) {
      // connectSocket(token);
      setupSocketListeners();
    }
  }, [fetchUserBets, setupSocketListeners]);
  return (
    <div className="p-6 flex gap-4">
      <div className="w-[63%]">
        <h1 className="text-2xl font-bold mb-6">Color Game</h1>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <GameTabs />
        </div>
        <Game />
        <div className="mt-6 bg-white shadow-md rounded-lg p-6">
          <UserBets />
        </div>
      </div>
      <div className="w-[33%]">
        <Wallet />
      </div>
    </div>
  );
};

export default ColorGame;
