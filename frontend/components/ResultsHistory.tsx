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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [winModalOpen, setWinModalOpen] = useState(false);
  const [loseModalOpen, setLoseModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    betAmount: "0.00",
    winAmount: "0.00",
    message: "",
  });
  const [lastProcessedResult, setLastProcessedResult] = useState<string | null>(
    null
  );

  const {
    gameResults,
    userBets,
    fetchUserBets,
    fetchGameResults,
    selectedGame,
    loading,
    refresh,
  } = useColorGameStore();

  // Handle modal display logic when results or bets change
  useEffect(() => {
    // Ensure we have data to process
    if (!gameResults.length || !userBets?.length) return;

    // Find the most recent game result
    const latestResult: GameResult = gameResults[0];

    // If we've already processed this result, don't process it again
    if (lastProcessedResult === latestResult.period_id) return;

    // Look for a matching bet for this period
    const matchingBet = userBets.find(
      (bet) => bet.period_id === latestResult.period_id
    );

    if (!matchingBet) return;

    // Determine if bet was successful
    let betWon = false;

    // Check if the bet matches the result
    if (
      (matchingBet.bet_type === "color" &&
        matchingBet.bet_value === latestResult.color) ||
      (matchingBet.bet_type === "number" &&
        matchingBet.bet_value === latestResult.number.toString()) ||
      (matchingBet.bet_type === "size" &&
        matchingBet.bet_value === latestResult.size)
    ) {
      betWon = true;
    }

    // Set modal data
    setModalData({
      betAmount:
        typeof matchingBet.total_amount === "number"
          ? matchingBet.total_amount.toLocaleString()
          : Number(matchingBet.total_amount).toLocaleString(),
      winAmount: betWon
        ? typeof matchingBet.win_amount === "number"
          ? matchingBet.win_amount.toLocaleString()
          : Number(matchingBet.win_amount).toLocaleString()
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
  const recentResults = useMemo(
    () =>
      gameResults.slice(0, 10).map((result: GameResult, index: number) => (
        <div
          key={`${result.period_id}-${index}`}
          className="flex flex-col items-center"
        >
          <ColorIndicator result={result} />
          <span className="text-xs mt-1">{result.size}</span>
        </div>
      )),
    [gameResults]
  );

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return gameResults.slice(startIndex, endIndex);
  }, [gameResults, currentPage]);

  const totalPages = Math.ceil(gameResults.length / itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Memoize detailed history to prevent unnecessary re-renders
  const detailedHistory = useMemo(
    () =>
      gameResults.slice(0, 5).map((result: GameResult, index: number) => {
        // Find if user placed a bet on this game
        const userBet = userBets?.find(
          (bet) => bet.period_id === result.period_id
        );
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
                  <p className="text-sm text-white">
                    <span className="font-semibold">{result.size}</span>
                  </p>
                  <p className="text-xs text-white">{result.game.duration}</p>
                  <p className="text-xs font-semibold text-white">
                    ID: {result.game.period}
                  </p>
                </div>
              </div>

              {hasBet && (
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      userBet.result === "win"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {userBet.result === "win" ? "Won" : "Lost"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Bet: {userBet.bet_value} ({userBet.bet_type})
                  </p>
                  <p className="text-xs font-semibold">
                    {userBet.result === "win"
                      ? `+${
                          typeof userBet.win_amount === "number"
                            ? userBet.win_amount
                            : userBet.win_amount
                        }`
                      : `-${
                          typeof userBet.total_amount === "number"
                            ? userBet.total_amount
                            : userBet.total_amount
                        }`}
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
      <div className="bg-[#3a3947] rounded-md mt-3 overflow-hidden shadow-lg">
        <div className="bg-gray-700 px-4 py-3">
          <div className="grid grid-cols-4 gap-4 text-white font-medium text-xs">
            <div>Period</div>
            <div className="text-center">Number</div>
            <div className="text-center">Big Small</div>
            <div className="text-center">Color</div>
          </div>
        </div>

        <div className="divide-y divide-gray-600">
          {loading ? (
            <div className="px-4 py-8 text-center text-gray-400">
              Loading results...
            </div>
          ) : paginatedResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400">
              No results available yet
            </div>
          ) : (
            paginatedResults.map((result: GameResult, index: number) => {
              const userBet = userBets?.find(
                (bet) => bet.period_id === result.period_id
              );
              const hasBet = !!userBet;

              return (
                <div
                  key={`${result.period_id}-${index}`}
                  className={`px-4 py-3 ${
                    hasBet ? "bg-blue-900 bg-opacity-30" : "bg-[#252424]"
                  } hover:bg-[#0f0e0e] transition-colors`}
                >
                  <div className="grid grid-cols-4 gap-4 items-center">
                    {/* Period */}
                    <div className="text-gray-300 text-xs font-mono">
                      <span>
                        {result.game?.period || result.period_id
                          ? `${(result.game?.period || result.period_id)
                              .toString()
                              .slice(0, 4)}${(
                              result.game?.period || result.period_id
                            )
                              .toString()
                              .slice(-4)}`
                          : ""}
                      </span>
                    </div>

                    {/* Number with Color */}
                    <div className="text-center">
                      <ColorIndicator result={result} />
                    </div>

                    {/* Big/Small */}
                    <div className="text-center">
                      <span className="text-white text-xs font-medium">
                        {result.size}
                      </span>
                    </div>

                    {/* Color Dot */}
                    <div className="text-center">
                      <div className="flex justify-center">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            result.color === "red"
                              ? "bg-red-500"
                              : result.color === "green"
                              ? "bg-green-500"
                              : result.color === "black"
                              ? "bg-black border border-gray-500"
                              : "bg-gray-500"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {hasBet && (
                    <div className="mt-2 pt-2 border-t border-gray-600">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">
                          Your bet: {userBet.bet_value} ({userBet.bet_type})
                        </span>
                        <span
                          className={`font-medium ${
                            userBet.result === "win"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {userBet.result === "win" ? "Won" : "Lost"} |
                          {userBet.result === "win"
                            ? ` +${
                                typeof userBet.win_amount === "number"
                                  ? userBet.win_amount
                                  : userBet.win_amount
                              }`
                            : ` -${
                                typeof userBet.total_amount === "number"
                                  ? userBet.total_amount
                                  : userBet.total_amount
                              }`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {gameResults.length > 0 && (
          <div className="bg-[#131212] px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">
                  {currentPage}/{totalPages}
                </span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsHistory;
