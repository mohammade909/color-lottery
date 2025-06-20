import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import {
  coinFlipAPI,
  getAuthToken,
  WEBSOCKET_URL,
  Game,
  GameResult,
  GameStats,
  CreateGameDto,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/app/dashboard/wallet/page";

const CoinFlipGame: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedChoice, setSelectedChoice] = useState<"heads" | "tails">(
    "heads"
  );
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [gameHistory, setGameHistory] = useState<Game[]>([]);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [coinSide, setCoinSide] = useState<"heads" | "tails">("heads");
  const [showResultPopup, setShowResultPopup] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { user: profile, getProfile } = useAuthStore();

  const userId = user?.id
  useEffect(() => {
    if (userId) {
      getProfile(userId);
    }
  }, [userId]);

  useEffect(() => {
    // Initialize socket connection
    const token = getAuthToken();

    if (!token) {
      console.error("No auth token found");
      return;
    }

    const newSocket = io(WEBSOCKET_URL, {
      auth: {
        token: token,
      },
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to game server");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("bet_placed", (data) => {
      if (data.success) {
        setCurrentGame(data.game);
        setBalance((prev) => prev - data.game.bet_amount);
      }
    });

    newSocket.on("coin_flip_start", () => {
      setIsFlipping(true);
      setShowResult(false);
    });

    newSocket.on("coin_flip_result", (data) => {
      if (data.success) {
        setLastResult(data.result);
        setBalance(data.result.newBalance);
        setCoinSide(data.result.result);
        setIsFlipping(false);
        setShowResult(true);
        setCurrentGame(null);
        // Auto-hide result after 5 seconds
        setTimeout(() => setShowResult(false), 5000);
      }
    });

    newSocket.on("game_history", (data) => {
      console.log(data);
      if (data.success) {
        setGameHistory(data.games);
      }
    });

    newSocket.on("game_stats", (data) => {
      if (data.success) {
        setGameStats(data.stats);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const placeBet = async () => {
    if (!socket || !isConnected || betAmount <= 0 || betAmount > balance)
      return;

    try {
      // First create the game via REST API
      const gameData: CreateGameDto = {
        bet_amount: betAmount,
        bet_choice: selectedChoice,
      };
      const game = await coinFlipAPI.createGame(gameData);
      setCurrentGame(game);
      setBalance((prev) => prev - game.bet_amount);

      // Then emit via WebSocket for real-time updates
      socket.emit("place_bet", gameData);
    } catch (error) {
      console.error("Error placing bet:", error);
      // Handle error - maybe show a toast notification
    }
  };

  const flipCoin = async () => {
    if (!socket || !currentGame) return;

    try {
      setIsFlipping(true);
      setShowResultPopup(false);
      // Emit via WebSocket for real-time animation
      const result = await coinFlipAPI.flipCoin(currentGame.id);
      setTimeout(() => {
        // Stop the spinning animation
        setIsFlipping(false);

        // Set the final coin side
        setCoinSide(result.result);

        // Store the result
        setLastResult(result);

        // Update balance
        setBalance(result.newBalance);

        // Clear current game
        setCurrentGame(null);

        // Show result popup after a brief delay to see the coin settle
        setTimeout(() => {
          setShowResultPopup(true);
        }, 500);

        // setGameHistory(prev => [newGame, ...prev.slice(0, 9)]);
      }, 2000);
      // socket.emit('flip_coin', {
      //   gameId: currentGame.id
      // });
    } catch (error) {
      console.error("Error flipping coin:", error);
      setIsFlipping(false);
    }
  };

  const getGameHistory = async () => {
    try {
      const result = await coinFlipAPI.getUserGames();
      setGameHistory(result);
    } catch (error) {
      console.log(error)
    }
  };

  const getGameStats = () => {
    if (!socket) return;
    socket.emit("get_game_stats");
  };

  useEffect(() => {
    getGameHistory();
    if (isConnected) {
      getGameStats();
    }
  }, [isConnected]);

  const closeResultPopup = () => {
    setShowResultPopup(false);
  };
  return (
    //     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 relative">
    //   <div className="max-w-6xl mx-auto">
    //     {/* Header */}
    //     <div className="text-center mb-8">
    //       <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
    //         🪙 Coin Flip Casino
    //       </h1>
    //       <p className="text-gray-300 text-lg">Test your luck with our exciting coin flip game!</p>
    //     </div>

    //     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    //       {/* Main Game Area */}
    //       <div className="lg:col-span-2">
    //         <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
    //           {/* Balance Display */}
    //           <div className="text-center mb-8">
    //             <div className="inline-block bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-6 shadow-xl">
    //               <h2 className="text-white text-xl font-semibold mb-2">Your Balance</h2>
    //               <div className="text-4xl font-bold text-white">${balance.toFixed(2)}</div>
    //             </div>
    //           </div>

    //           {/* Enhanced Coin Animation */}
    //           <div className="flex justify-center mb-8">
    //             <div className="relative">
    //               <div
    //                 className={`w-40 h-40 rounded-full border-8 border-yellow-400 shadow-2xl transition-all duration-500 ${
    //                   isFlipping ? 'animate-spin' : ''
    //                 } ${coinSide === 'heads' ? 'bg-gradient-to-br from-yellow-300 to-yellow-600' : 'bg-gradient-to-br from-gray-300 to-gray-600'}`}
    //                 style={{
    //                   animation: isFlipping ? 'spin 0.1s linear infinite' : 'none',
    //                   transform: isFlipping ? 'rotateY(0deg)' : coinSide === 'heads' ? 'rotateY(0deg)' : 'rotateY(180deg)',
    //                   transformStyle: 'preserve-3d'
    //                 }}
    //               >
    //                 <div className="absolute inset-0 flex items-center justify-center">
    //                   <div className="text-6xl font-bold text-white drop-shadow-lg">
    //                     {isFlipping ? (Math.random() > 0.5 ? '👑' : 'T') : (coinSide === 'heads' ? '👑' : 'T')}
    //                   </div>
    //                 </div>
    //               </div>
    //               {isFlipping && (
    //                 <>
    //                   <div className="absolute -inset-4 rounded-full border-4 border-yellow-300 animate-ping opacity-20"></div>
    //                   <div className="absolute -inset-8 rounded-full border-2 border-yellow-200 animate-pulse opacity-10"></div>
    //                 </>
    //               )}
    //             </div>
    //           </div>

    //           {/* Betting Controls */}
    //           {!currentGame && !isFlipping && (
    //             <div className="space-y-6">
    //               <div>
    //                 <label className="block text-white text-lg font-semibold mb-3">Bet Amount</label>
    //                 <div className="flex items-center space-x-4">
    //                   <input
    //                     type="number"
    //                     value={betAmount}
    //                     onChange={(e) => setBetAmount(Number(e.target.value))}
    //                     className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    //                     placeholder="Enter bet amount"
    //                     min="1"
    //                     max={balance}
    //                   />
    //                   <div className="flex space-x-2">
    //                     {[10, 25, 50, 100].map((amount) => (
    //                       <button
    //                         key={amount}
    //                         onClick={() => setBetAmount(amount)}
    //                         className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
    //                         disabled={amount > balance}
    //                       >
    //                         ${amount}
    //                       </button>
    //                     ))}
    //                   </div>
    //                 </div>
    //               </div>

    //               <div>
    //                 <label className="block text-white text-lg font-semibold mb-3">Choose Your Side</label>
    //                 <div className="grid grid-cols-2 gap-4">
    //                   <button
    //                     onClick={() => setSelectedChoice('heads')}
    //                     className={`p-6 rounded-xl border-2 transition-all ${
    //                       selectedChoice === 'heads'
    //                         ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
    //                         : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
    //                     }`}
    //                   >
    //                     <div className="text-4xl mb-2">👑</div>
    //                     <div className="text-xl font-bold">Heads</div>
    //                   </button>
    //                   <button
    //                     onClick={() => setSelectedChoice('tails')}
    //                     className={`p-6 rounded-xl border-2 transition-all ${
    //                       selectedChoice === 'tails'
    //                         ? 'border-gray-400 bg-gray-400/20 text-gray-300'
    //                         : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
    //                     }`}
    //                   >
    //                     <div className="text-4xl mb-2">T</div>
    //                     <div className="text-xl font-bold">Tails</div>
    //                   </button>
    //                 </div>
    //               </div>

    //               <button
    //                 onClick={placeBet}
    //                 disabled={betAmount <= 0 || betAmount > balance}
    //                 className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white text-xl font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
    //               >
    //                 Place Bet - ${betAmount.toFixed(2)}
    //               </button>
    //             </div>
    //           )}

    //           {/* Game in Progress */}
    //           {currentGame && !isFlipping && (
    //             <div className="text-center space-y-6">
    //               <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
    //                 <h3 className="text-white text-xl font-semibold mb-2">Bet Placed!</h3>
    //                 <p className="text-gray-300">
    //                   Betting ${currentGame.bet_amount} on {currentGame.bet_choice}
    //                 </p>
    //               </div>
    //               <button
    //                 onClick={flipCoin}
    //                 className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-xl font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
    //               >
    //                 🎲 Flip the Coin!
    //               </button>
    //             </div>
    //           )}

    //           {/* Flipping State */}
    //           {isFlipping && (
    //             <div className="text-center">
    //               <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6">
    //                 <h3 className="text-white text-xl font-semibold mb-2">🪙 Flipping...</h3>
    //                 <p className="text-gray-300">Hold your breath!</p>
    //                 <div className="mt-4">
    //                   <div className="w-full bg-gray-200 rounded-full h-2">
    //                     <div className="bg-yellow-400 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //           )}
    //         </div>
    //       </div>

    //       {/* Sidebar */}
    //       <div className="space-y-6">

    //         {/* Recent Games */}
    //         <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
    //           <h3 className="text-white text-xl font-bold mb-4">🕒 Recent Games</h3>
    //           <div className="space-y-3 max-h-80 overflow-y-auto">
    //             {gameHistory.map((game, index) => (
    //               <div
    //                 key={game.id || index}
    //                 className={`p-3 rounded-lg border ${
    //                   game.won_amount > 0
    //                     ? 'bg-green-500/10 border-green-500/30'
    //                     : 'bg-red-500/10 border-red-500/30'
    //                 }`}
    //               >
    //                 <div className="flex justify-between items-center">
    //                   <div>
    //                     <div className="text-sm text-gray-300">
    //                       Bet: ${game.bet_amount} on {game.bet_choice}
    //                     </div>
    //                     <div className="text-xs text-gray-400">
    //                       Result: {game.result}
    //                     </div>
    //                   </div>
    //                   <div className={`text-sm font-semibold ${
    //                     game.won_amount > 0 ? 'text-green-400' : 'text-red-400'
    //                   }`}>
    //                     {game.won_amount > 0 ? `+$${game.won_amount}` : `-$${game.bet_amount}`}
    //                   </div>
    //                 </div>
    //               </div>
    //             ))}
    //             {gameHistory.length === 0 && (
    //               <div className="text-center text-gray-400 py-8">
    //                 No games yet. Place your first bet!
    //               </div>
    //             )}
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Result Popup Modal */}
    //   {showResultPopup && lastResult && (
    //     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    //       <div className={`max-w-md w-full rounded-2xl p-8 border-2 shadow-2xl transform transition-all ${
    //         lastResult.isWin
    //           ? 'bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-400/50'
    //           : 'bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-400/50'
    //       }`}>
    //         <div className="text-center">
    //           {/* Animated Result Icon */}
    //           <div className={`text-8xl mb-6 transform transition-all duration-1000 ${
    //             showResultPopup ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
    //           }`}>
    //             {lastResult.isWin ? '🎉' : '😔'}
    //           </div>

    //           {/* Result Text */}
    //           <h2 className={`text-4xl font-bold mb-4 ${
    //             lastResult.isWin ? 'text-green-300' : 'text-red-300'
    //           }`}>
    //             {lastResult.isWin ? 'YOU WON!' : 'YOU LOST!'}
    //           </h2>

    //           {/* Coin Result */}
    //           <div className="mb-6">
    //             <p className="text-xl text-white mb-2">
    //               The coin landed on
    //             </p>
    //             <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-xl ${
    //               lastResult.result === 'heads'
    //                 ? 'bg-yellow-400/20 border border-yellow-400/50'
    //                 : 'bg-gray-400/20 border border-gray-400/50'
    //             }`}>
    //               <div className="text-3xl">
    //                 {lastResult.result === 'heads' ? '👑' : 'T'}
    //               </div>
    //               <div className="text-2xl font-bold text-white capitalize">
    //                 {lastResult.result}
    //               </div>
    //             </div>
    //           </div>

    //           {/* Win Amount */}
    //           {lastResult.isWin && (
    //             <div className="mb-6">
    //               <p className="text-green-300 text-xl">
    //                 You won <span className="font-bold text-2xl">${lastResult.wonAmount.toFixed(2)}</span>!
    //               </p>
    //             </div>
    //           )}

    //           {/* New Balance */}
    //           <div className="mb-8">
    //             <p className="text-gray-300 text-lg">
    //               New Balance: <span className="text-white font-bold text-xl">${lastResult.newBalance.toFixed(2)}</span>
    //             </p>
    //           </div>

    //           {/* Close Button */}
    //           <button
    //             onClick={closeResultPopup}
    //             className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
    //           >
    //             Play Again
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </div>
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 relative">
      <style jsx>{`
        @keyframes coinFlip {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(900deg);
          }
          100% {
            transform: rotateY(1800deg);
          }
        }

        .coin-flip {
          animation: coinFlip 2s ease-in-out;
          transform-style: preserve-3d;
        }

        .coin-face {
          backface-visibility: hidden;
          position: absolute;
          inset: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .coin-heads {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
        }

        .coin-tails {
          background: linear-gradient(135deg, #9ca3af, #6b7280);
          transform: rotateY(180deg);
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            🪙 Coin Flip Casino
          </h1>
          <p className="text-gray-300 text-lg">
            Test your luck with our exciting coin flip game!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* Balance Display */}
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-white text-xl font-semibold mb-2">
                    Your Balance
                  </h2>
                  <div className="text-4xl font-bold text-white">
                  ₹{profile ? formatCurrency(profile.wallet) : "0.00"}
                  </div>
                </div>
              </div>

              {/* Enhanced 3D Coin Animation */}
              <div className="flex justify-center mb-8">
                <div className="relative perspective-1000">
                  <div
                    className={`w-40 h-40 relative ${isFlipping ? "coin-flip" : ""
                      }`}
                    style={{
                      transformStyle: "preserve-3d",
                      transform: !isFlipping
                        ? coinSide === "heads"
                          ? "rotateY(0deg)"
                          : "rotateY(180deg)"
                        : undefined,
                    }}
                  >
                    {/* Heads side */}
                    <div className="coin-face coin-heads border-8 border-yellow-400 shadow-2xl">
                      <div className="text-6xl font-bold text-white drop-shadow-lg">
                        👑
                      </div>
                    </div>

                    {/* Tails side */}
                    <div className="coin-face coin-tails border-8 border-yellow-400 shadow-2xl">
                      <div className="text-6xl font-bold text-white drop-shadow-lg">
                        T
                      </div>
                    </div>
                  </div>

                  {/* Flip effects */}
                  {isFlipping && (
                    <>
                      <div className="absolute -inset-4 rounded-full border-4 border-yellow-300 animate-ping opacity-20"></div>
                      <div className="absolute -inset-8 rounded-full border-2 border-yellow-200 animate-pulse opacity-10"></div>
                    </>
                  )}
                </div>
              </div>

              {/* Betting Controls */}
              {!currentGame && !isFlipping && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-white text-lg font-semibold mb-3">
                      Bet Amount
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter bet amount"
                        min="1"
                        max={balance}
                      />
                      <div className="flex space-x-2">
                        {[10, 25, 50, 100].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setBetAmount(amount)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            disabled={amount > balance}
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-lg font-semibold mb-3">
                      Choose Your Side
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSelectedChoice("heads")}
                        className={`p-6 rounded-xl border-2 transition-all ${selectedChoice === "heads"
                            ? "border-yellow-400 bg-yellow-400/20 text-yellow-300"
                            : "border-white/30 bg-white/10 text-white hover:bg-white/20"
                          }`}
                      >
                        <div className="text-4xl mb-2">👑</div>
                        <div className="text-xl font-bold">Heads</div>
                      </button>
                      <button
                        onClick={() => setSelectedChoice("tails")}
                        className={`p-6 rounded-xl border-2 transition-all ${selectedChoice === "tails"
                            ? "border-gray-400 bg-gray-400/20 text-gray-300"
                            : "border-white/30 bg-white/10 text-white hover:bg-white/20"
                          }`}
                      >
                        <div className="text-4xl mb-2">T</div>
                        <div className="text-xl font-bold">Tails</div>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={placeBet}
                    disabled={betAmount <= 0 || betAmount > balance}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white text-xl font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
                  >
                    Place Bet - ${betAmount.toFixed(2)}
                  </button>
                </div>
              )}

              {/* Game in Progress */}
              {currentGame && !isFlipping && (
                <div className="text-center space-y-6">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
                    <h3 className="text-white text-xl font-semibold mb-2">
                      Bet Placed!
                    </h3>
                    <p className="text-gray-300">
                      Betting ${currentGame.bet_amount} on{" "}
                      {currentGame.bet_choice}
                    </p>
                  </div>
                  <button
                    onClick={flipCoin}
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-xl font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    🎲 Flip the Coin!
                  </button>
                </div>
              )}

              {/* Flipping State */}
              {isFlipping && (
                <div className="text-center">
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6">
                    <h3 className="text-white text-xl font-semibold mb-2">
                      🪙 Flipping...
                    </h3>
                    <p className="text-gray-300">Hold your breath!</p>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200/20 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full animate-pulse"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Games */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-white text-xl font-bold mb-4">
                🕒 Recent Games
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {gameHistory.map((game, index) => (
                  <div
                    key={game.id || index}
                    className={`p-3 rounded-lg border ${game.won_amount > 0
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-300">
                          Bet: ${game.bet_amount} on {game.bet_choice}
                        </div>
                        <div className="text-xs text-gray-400">
                          Result: {game.result}
                        </div>
                      </div>
                      <div
                        className={`text-sm font-semibold ${game.won_amount > 0
                            ? "text-green-400"
                            : "text-red-400"
                          }`}
                      >
                        {game.won_amount > 0
                          ? `+$${game.won_amount}`
                          : `-$${game.bet_amount}`}
                      </div>
                    </div>
                  </div>
                ))}
                {gameHistory.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    No games yet. Place your first bet!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Popup Modal */}
      {showResultPopup && lastResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`max-w-md w-full rounded-2xl p-8 border-2 shadow-2xl transform transition-all ${lastResult.isWin
                ? "bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-400/50"
                : "bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-400/50"
              }`}
          >
            <div className="text-center">
              {/* Animated Result Icon */}
              <div
                className={`text-8xl mb-6 transform transition-all duration-1000 ${showResultPopup ? "scale-100 rotate-0" : "scale-0 rotate-180"
                  }`}
              >
                {lastResult.isWin ? "🎉" : "😔"}
              </div>

              {/* Result Text */}
              <h2
                className={`text-4xl font-bold mb-4 ${lastResult.isWin ? "text-green-300" : "text-red-300"
                  }`}
              >
                {lastResult.isWin ? "YOU WON!" : "YOU LOST!"}
              </h2>

              {/* Coin Result */}
              <div className="mb-6">
                <p className="text-xl text-white mb-2">The coin landed on</p>
                <div
                  className={`inline-flex items-center space-x-3 px-6 py-3 rounded-xl ${lastResult.result === "heads"
                      ? "bg-yellow-400/20 border border-yellow-400/50"
                      : "bg-gray-400/20 border border-gray-400/50"
                    }`}
                >
                  <div className="text-3xl">
                    {lastResult.result === "heads" ? "👑" : "T"}
                  </div>
                  <div className="text-2xl font-bold text-white capitalize">
                    {lastResult.result}
                  </div>
                </div>
              </div>

              {/* Win Amount */}
              {lastResult.isWin && (
                <div className="mb-6">
                  <p className="text-green-300 text-xl">
                    You won{" "}
                    <span className="font-bold text-2xl">
                      ${lastResult.wonAmount.toFixed(2)}
                    </span>
                    !
                  </p>
                </div>
              )}

              {/* New Balance */}
              <div className="mb-8">
                <p className="text-gray-300 text-lg">
                  New Balance:{" "}
                  <span className="text-white font-bold text-xl">
                    ${lastResult.newBalance.toFixed(2)}
                  </span>
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={closeResultPopup}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoinFlipGame;
