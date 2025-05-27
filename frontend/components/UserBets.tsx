'use client'
import React, { useEffect, useState } from 'react';
import useColorGameStore, { UserBet } from '@/store/useColorGameStore';

const UserBets: React.FC = () => {
  const { userBets, fetchUserBets, loading, error } = useColorGameStore();
  const [debugInfo, setDebugInfo] = useState({ fetched: false });

  useEffect(() => {
    // console.log("UserBets component mounted");
    const fetchData = async () => {
      // console.log("Fetching user bets...");
      try {
        await fetchUserBets();
        setDebugInfo({ fetched: true });
        // console.log("User bets fetched successfully:", userBets);
      } catch (err) {
        console.error("Error fetching user bets:", err);
      }
    };
    
    fetchData();
    
    // Note: userBets is intentionally not in the dependency array
    // as it would cause an infinite loop
  }, [fetchUserBets]);

  // For debugging - show the current state


  if (loading) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Your Bets</h3>
        <div className="bg-gray-100 rounded-md p-4 text-center text-gray-600">
          Loading your bets...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Your Bets</h3>
        <div className="bg-red-100 rounded-md p-4 text-center text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

  if (userBets.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Your Bets</h3>
        <div className="bg-gray-100 rounded-md p-4 text-center text-gray-600">
          {debugInfo.fetched ? "You haven't placed any bets yet" : "Waiting for bet data..."}
        </div>
      </div>
    );
  }
  
  // Style for bet result
  const getBetResultStyle = (bet: UserBet) => {
    if (!bet.result) return 'bg-gray-100 text-gray-600';
    return bet.result === 'win' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Your Bets</h3>
      <div className="bg-white shadow overflow-hidden rounded-md">
        <ul className="divide-y divide-gray-200">
          {userBets.slice(0, 10).map((bet) => {
            const date = new Date(bet.timestamp);
            const formattedDate = date.toLocaleString();
            
            return (
              <li key={bet.id} className="px-4 py-4">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-sm font-medium text-gray-900">
                      {bet.bet_type.charAt(0).toUpperCase() + bet.bet_type.slice(1)}: {bet.bet_value}
                    </p>
                    <p className="text-xs text-gray-500">{bet.period}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Amount: <span className="font-medium">{bet.amount}</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      x{bet.multiplier}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBetResultStyle(bet)}`}>
                      {!bet.result 
                        ? 'Pending' 
                        : bet.result === 'win' 
                          ? `Won ${bet.win_amount}` 
                          : 'Lost'
                      }
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default UserBets;