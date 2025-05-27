// app/SocketInitializer.tsx
"use client";
import { useEffect } from "react";
import socketManager from "../lib/socketManager";

export default function SocketInitializer() {
  useEffect(() => {
    // Connect to the socket server
    socketManager.connect();

    // Request initial data
    socketManager.getActiveGames();
    socketManager.getRecentResults();

    // Get user bets if userId exists
    const userId = localStorage.getItem("userId");
    if (userId) {
      socketManager.getUserBets(userId);
    }

    return () => {
      socketManager.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}