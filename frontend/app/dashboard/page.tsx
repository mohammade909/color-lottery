"use client";
import { useEffect } from "react";
import Layout from "@/components/Layout/Layout";
import GameTabs from "@/components/GameTabs";
import BetOptions from "@/components/BetOptions";
import BetForm from "@/components/BetForm";
import ResultsHistory from "@/components/ResultsHistory";
import UserBets from "@/components/UserBets";
import useColorGameStore from "@/store/useColorGameStore";
// import { connectSocket } from "@/lib/socket";

export default function Dashboard() {
  const {
    fetchActiveGames,
    fetchGameResults,
    fetchUserBets,
    setupSocketListeners,
  } = useColorGameStore();

  useEffect(() => {
    // Initial data loading
    fetchActiveGames();
    fetchGameResults();
    fetchUserBets();

    // Setup socket connections
    const token = localStorage.getItem("token");
    if (token) {
      // connectSocket(token);
      setupSocketListeners();
    }

    // Set up polling for active games (as a fallback)
    const interval = setInterval(() => {
      fetchActiveGames();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchActiveGames, fetchGameResults, fetchUserBets, setupSocketListeners]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Color Game</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <GameTabs />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <BetOptions />
          <BetForm />
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <ResultsHistory />
        </div>
      </div>

      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <UserBets />
      </div> 
    </div>
  );
}

// 'use client'
// import React, { useState, useEffect } from "react";
// import { useGame } from "../../context/gameContext";
// import GameCard from "../../components/GameCard";
// import { BetType, GameDuration } from "../../types";


// const GamePage: React.FC = () => {
//   const {
//     isConnected,
//     isConnecting,
//     activeGames,
//     recentResults,
//     userBets,
//     placeBet,
//   } = useGame();


//   const [userId, setUserId] = useState<string>("");
//   const [selectedDuration, setSelectedDuration] = useState<string>(
//     GameDuration.THIRTY_SECONDS
//   );
//   const [notification, setNotification] = useState<{
//     type: string;
//     message: string;
//   } | null>(null);


//   console.log("results",recentResults)
//   console.log("activeGames",activeGames)
//   console.log("userBets",userBets)
//   console.log("userBets",userBets)
//   // Load user ID from localStorage
//   useEffect(() => {
//     const authStorageString = localStorage.getItem('auth-storage');
//     if (authStorageString) {
//         const userData = JSON.parse(authStorageString);
//         console.log(userData)
//         const userId = userData?.state?.user?.id;

//       setUserId(userId);
//     } 
//   }, []);

//   // Find the selected game
//   const selectedGame = activeGames.find(
//     (game) => game.duration === selectedDuration
//   );

//   // Find result for the selected game
//   const gameResult = selectedGame
//     ? recentResults.find((r) => r.period_id === selectedGame.id)
//     : null;

//   // Handle placing a bet
//   const handlePlaceBet = async (
//     betType: BetType,
//     betValue: string,
//     amount: number
//   ) => {
//     if (!selectedGame || !userId) return;

//     try {
//       const betRequest = {
//         user_id: userId,
//         period_id: selectedGame.id,
//         bet_type: betType,
//         bet_value: betValue,
//         amount: amount,
//       };

//       const result = await placeBet(betRequest);

//       if (result) {
//         setNotification({
//           type: "success",
//           message: `Bet placed successfully! Bet ID: ${result.id.substring(
//             0,
//             8
//           )}`,
//         });
//       }
//     } catch (error) {
//       setNotification({
//         type: "error",
//         message: `Failed to place bet: ${
//           error instanceof Error ? error.message : "Unknown error"
//         }`,
//       });
//     }

//     // Clear notification after 3 seconds
//     setTimeout(() => {
//       setNotification(null);
//     }, 3000);
//   };

//   // Show loading indicator while connecting to socket
//   if (isConnecting) {
//     return (
//       <div className="flex h-screen justify-center items-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4">Connecting to game server...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show error if not connected
//   if (!isConnected) {
//     return (
//       <div className="flex h-screen justify-center items-center">
//         <div className="text-center bg-red-50 p-6 rounded-lg shadow">
//           <h2 className="text-red-600 text-xl font-semibold mb-2">
//             Connection Error
//           </h2>
//           <p className="mb-4">
//             Unable to connect to the game server. Please try again later.
//           </p>
//           <button
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//             onClick={() => window.location.reload()}
//           >
//             Retry Connection
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-6">Color Game</h1>

//       {/* Duration Selection */}
//       <div className="mb-6">
//         <h2 className="text-lg font-semibold mb-2">Select Game Duration</h2>
//         <div className="flex gap-2 flex-wrap">
//           {Object.values(GameDuration).map((duration) => (
//             <button
//               key={duration}
//               className={`px-4 py-2 rounded-md ${
//                 selectedDuration === duration
//                   ? "bg-blue-500 text-white"
//                   : "bg-gray-200 text-gray-700"
//               }`}
//               onClick={() => setSelectedDuration(duration)}
//             >
//               {duration}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Notification */}
//       {notification && (
//         <div
//           className={`p-3 rounded-md mb-4 ${
//             notification.type === "success"
//               ? "bg-green-100 text-green-700"
//               : "bg-red-100 text-red-700"
//           }`}
//         >
//           {notification.message}
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Main Game Area */}
//         <div className="md:col-span-2">
//           <h2 className="text-lg font-semibold mb-2">Current Game</h2>
//           {selectedGame ? (
//             <GameCard
//               game={selectedGame}
//               result={gameResult || undefined}
//               onPlaceBet={handlePlaceBet}
//             />
//           ) : (
//             <div className="bg-gray-100 rounded-lg p-4 text-center">
//               No active game found for selected duration
//             </div>
//           )}
//         </div>

//         {/* Side Panel */}
//         <div>
//           {/* User Bets */}
//           <div className="bg-white rounded-lg shadow-md p-4 mb-4">
//             <h2 className="text-lg font-semibold mb-2">Your Recent Bets</h2>
//             {userBets.length > 0 ? (
//               <div className="max-h-96 overflow-y-auto">
//                 {userBets.slice(0, 10).map((bet) => (
//                   <div
//                     key={bet.id}
//                     className={`border-b last:border-b-0 py-2 ${
//                       bet.result === "win"
//                         ? "bg-green-50"
//                         : bet.result === "lose"
//                         ? "bg-red-50"
//                         : ""
//                     }`}
//                   >
//                     <div className="flex justify-between text-sm">
//                       <span>Period: {bet.period_id.substring(0, 8)}...</span>
//                       <span
//                         className={
//                           bet.result === "win"
//                             ? "text-green-600 font-medium"
//                             : bet.result === "lose"
//                             ? "text-red-600"
//                             : "text-gray-500"
//                         }
//                       >
//                         {bet.result || "Pending"}
//                       </span>
//                     </div>
//                     <div className="text-sm mt-1">
//                       <span className="text-gray-600">
//                         {bet.bet_type}: {bet.bet_value} • Amount: {bet.amount}
//                       </span>
//                     </div>
//                     {bet.result === "win" && (
//                       <div className="text-green-600 text-sm font-semibold mt-1">
//                         Won: {bet.win_amount}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center py-4">
//                 No bets placed yet
//               </p>
//             )}
//           </div>

//           {/* Recent Results */}
//           <div className="bg-white rounded-lg shadow-md p-4">
//             <h2 className="text-lg font-semibold mb-2">Recent Results</h2>
//             <div className="grid grid-cols-5 gap-1 max-h-64 overflow-y-auto">
//               {recentResults.map((result) => (
//                 <div
//                   key={result.period_id}
//                   className={`p-2 rounded flex items-center justify-center aspect-square text-white font-medium ${
//                     result.color === "red"
//                       ? "bg-red-500"
//                       : result.color === "green"
//                       ? "bg-green-500"
//                       : "bg-black"
//                   }`}
//                   title={`Number: ${result.number}, Color: ${result.color}, Size: ${result.size}`}
//                 >
//                   {result.number}
//                 </div>
//               ))}

//               {recentResults.length === 0 && (
//                 <div className="col-span-5 text-center py-4 text-gray-500">
//                   No recent results
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GamePage;
