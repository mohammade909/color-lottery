"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import useColorGameStore, { GameResult } from "@/store/useColorGameStore";
import { ResultModal } from "./ResultModal";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

// Color indicator component extracted for better organization
const ColorIndicator = ({ result }: { result: GameResult }) => {
  const colorMap: Record<string, string> = {
    red: "bg-red-500",
    green: "bg-green-500",
    black: "bg-black",
    default: "bg-gray-500",
  };

  const bgColor = colorMap[result.color] || colorMap.default;

  return (
    <div
      className={`w-8 h-8 rounded-full ${bgColor} text-white flex items-center justify-center font-bold`}
    >
      {result.number}
    </div>
  );
};

const ResultsHistory: React.FC = () => {
  const { user } = useAuth();
  const { getProfile } = useAuthStore();
  const [winModalOpen, setWinModalOpen] = useState(false);
  const [loseModalOpen, setLoseModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    betAmount: "0.00",
    winAmount: "0.00",
    message: "",
  });
  const [lastProcessedResult, setLastProcessedResult] = useState<string | null>(null);

  const { 
    gameResults, 
    userBets, 
    fetchUserBets, 
    fetchGameResults, 
    loading, 
    refresh 
  } = useColorGameStore();

  // Memoize refresh function to prevent unnecessary re-renders
  const refreshData = useCallback(() => {
    fetchGameResults();
    fetchUserBets();
    if (user?.id) {
      getProfile(user.id);
    }
  }, [fetchGameResults, fetchUserBets, getProfile, user?.id]);

  // Initial data fetch
  // useEffect(() => {
  //   refreshData();
    
  //   // Set up periodic refresh every 30 seconds
  //   const intervalId = setInterval(refreshData, 30000);
    
  //   // Clean up interval on component unmount
  //   return () => clearInterval(intervalId);
  // }, [refreshData, refresh]);

  // Handle modal display logic when results or bets change
  useEffect(() => {
    // Ensure we have data to process
    if (!gameResults.length || !userBets?.length) return;
    
    // Find the most recent game result
    const latestResult: GameResult = gameResults[0];
    
    // If we've already processed this result, don't process it again
    if (lastProcessedResult === latestResult.period_id) return;
    
    // Look for a matching bet for this period
    const matchingBet = userBets.find(bet => bet.period_id === latestResult.period_id);
    
    if (!matchingBet) return;
    
    // Determine if bet was successful
    let betWon = false;
    
    // Check if the bet matches the result
    if (
      (matchingBet.bet_type === "color" && matchingBet.bet_value === latestResult.color) ||
      (matchingBet.bet_type === "number" && matchingBet.bet_value === latestResult.number.toString()) ||
      (matchingBet.bet_type === "size" && matchingBet.bet_value === latestResult.size)
    ) {
      betWon = true;
    }
    
    // Set modal data
    setModalData({
      betAmount: typeof matchingBet.total_amount === 'number' 
        ? matchingBet.total_amount.toLocaleString() 
        : Number(matchingBet.total_amount).toLocaleString(),
      winAmount: betWon 
        ? (typeof matchingBet.win_amount === 'number' 
          ? matchingBet.win_amount.toLocaleString() 
          : Number(matchingBet.win_amount).toLocaleString()) 
        : "0.00",
      message: betWon
        ? `You won! Your bet on ${matchingBet.bet_value} was correct.`
        : `Better luck next time. Your bet on ${matchingBet.bet_value} didn't match the ${latestResult.color} ${latestResult.number} (${latestResult.size}).`,
    });
    
    // Show appropriate modal and mark this result as processed
    if (betWon) {
      setWinModalOpen(true);
    } else {
      setLoseModalOpen(true);
    }
    
    setLastProcessedResult(latestResult.period_id);
  }, [gameResults, userBets, lastProcessedResult]);

  // Memoize recent results to prevent unnecessary re-renders
  const recentResults = useMemo(() => 
    gameResults.slice(0, 10).map((result: GameResult, index: number) => (
      <div key={`${result.period_id}-${index}`} className="flex flex-col items-center">
        <ColorIndicator result={result} />
        <span className="text-xs mt-1">{result.size}</span>
      </div>
    )),
    [gameResults]
  );

  // Memoize detailed history to prevent unnecessary re-renders
  const detailedHistory = useMemo(() => 
    gameResults.slice(0, 5).map((result: GameResult, index: number) => {
      // Find if user placed a bet on this game
      const userBet = userBets?.find(bet => bet.period_id === result.period_id);
      const hasBet = !!userBet;

      return (
        <li
          key={`${result.period_id}-${index}-detail`}
          className={`px-4 py-3 ${hasBet ? "bg-blue-50" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ColorIndicator result={result} />
              <div>
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{result.size}</span>
                </p>
                <p className="text-xs text-gray-500">{result.game.duration}</p>
                <p className="text-xs font-semibold text-gray-800">ID: {result.game.period}</p>
              </div>
            </div>

            {hasBet && (
              <div className="text-right">
                <p className={`text-sm font-medium ${userBet.result === "win" ? "text-green-600" : "text-red-600"}`}>
                  {userBet.result === "win" ? "Won" : "Lost"}
                </p>
                <p className="text-xs text-gray-500">
                  Bet: {userBet.bet_value} ({userBet.bet_type})
                </p>
                <p className="text-xs font-semibold">
                  {userBet.result === "win" 
                    ? `+${typeof userBet.win_amount === 'number' ? userBet.win_amount : userBet.win_amount}` 
                    : `-${typeof userBet.total_amount === 'number' ? userBet.total_amount : userBet.total_amount}`}
                </p>
              </div>
            )}
          </div>
        </li>
      );
    }),
    [gameResults, userBets]
  );

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Results</h3>
        <button
          onClick={refreshData}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md flex items-center"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Win Modal */}
      <ResultModal
        isOpen={winModalOpen}
        onClose={() => setWinModalOpen(false)}
        type="win"
        message={modalData.message}
        score={parseFloat(modalData.winAmount)}
        onPlayAgain={() => setWinModalOpen(false)}
      />

      {/* Lose Modal */}
      <ResultModal
        isOpen={loseModalOpen}
        onClose={() => setLoseModalOpen(false)}
        type="lose"
        message={modalData.message}
        score={parseFloat(modalData.betAmount)}
        onPlayAgain={() => setLoseModalOpen(false)}
      />

      {/* Recent Results Grid */}
      <div className="grid grid-cols-10 gap-2">
        {recentResults}
        {gameResults.length === 0 && (
          <div className="col-span-10 text-center py-4 text-gray-500">
            {loading ? "Loading results..." : "No results available yet"}
          </div>
        )}
      </div>

      {/* Detailed History */}
      {gameResults.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium mb-2">Detailed History</h4>
          <div className="bg-white shadow overflow-hidden rounded-md">
            <ul className="divide-y divide-gray-200">
              {detailedHistory}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsHistory;