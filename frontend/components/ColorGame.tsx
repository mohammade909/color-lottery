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
    <div className=" bg-gray-900 p-6">
      <Wallet />
      <GameTabs />
      <Game />
      <div className="mt-6  bg-gray-800 shadow-md rounded-md">
        <UserBets />
      </div>
    </div>
  );
};

export default ColorGame;
