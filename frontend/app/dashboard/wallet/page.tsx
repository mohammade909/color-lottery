"use client";
import React, { useState, useEffect } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  CreditCard,
  Crown,
  Gamepad2,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Volume2,
  Wallet2,
  Zap,
} from "lucide-react";
import DepositModal from "@/components/DepositModal";
import WithdrawalModal from "@/components/WithdrawalModal";
import { transactionAPI } from "@/lib/api";

interface WalletProps {
  userId?: string;
}

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  timestamp: string;
  description: string;
  balance_after: number;
}

const cards = [
  {
    icon: Wallet2,
    label: "AR Wallet",
    color: "text-cyan-400",
    bgColor: "bg-gradient-to-br from-cyan-500 to-blue-600",
    shadowColor: "shadow-cyan-500/50",
    borderColor: "border-cyan-400/50",
    description: "Manage Funds",
    glow: "shadow-cyan-400/40",
  },
  {
    icon: CreditCard,
    label: "Deposit",
    color: "text-amber-400",
    bgColor: "bg-gradient-to-br from-amber-500 to-orange-600",
    shadowColor: "shadow-amber-500/50",
    borderColor: "border-amber-400/50",
    description: "Add Money",
    glow: "shadow-amber-400/40",
  },
  {
    icon: ArrowUpFromLine,
    label: "Withdraw",
    color: "text-purple-400",
    bgColor: "bg-gradient-to-br from-purple-500 to-pink-600",
    shadowColor: "shadow-purple-500/50",
    borderColor: "border-purple-400/50",
    description: "Cash Out",
    glow: "shadow-purple-400/40",
  },
  {
    icon: Crown,
    label: "VIP Zone",
    color: "text-emerald-400",
    bgColor: "bg-gradient-to-br from-emerald-500 to-green-600",
    shadowColor: "shadow-emerald-500/50",
    borderColor: "border-emerald-400/50",
    description: "Premium Access",
    glow: "shadow-emerald-400/40",
  },
];

const gameStats = [
  {
    label: "Games Played",
    value: "1,247",
    icon: Gamepad2,
    color: "text-blue-400",
  },
  { label: "Win Rate", value: "78.5%", icon: Target, color: "text-green-400" },
  {
    label: "Total Winnings",
    value: "₹87,450",
    icon: Trophy,
    color: "text-yellow-400",
  },
  { label: "Current Streak", value: "12", icon: Zap, color: "text-orange-400" },
];

// Updated UserGameHistory component to accept transactions as props
interface UserGameHistoryProps {
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
}

const UserGameHistory: React.FC<UserGameHistoryProps> = ({ transactions, formatCurrency }) => {
  // Helper function to format time difference
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const transactionTime = new Date(timestamp);
    const diffInMs = now.getTime() - transactionTime.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins} mins ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${diffInDays} days ago`;
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type: string, amount: number) => {
    if (type === "deposit") return "💰";
    return "💸";
  };

  // Get transaction title based on type and description
  const getTransactionTitle = (transaction: Transaction) => {
    if (transaction.type === "deposit") {
      return transaction.description || "Wallet Deposit";
    } else {
      return transaction.description || "Wallet Withdrawal";
    }
  };

  return (
    <div className="mt-8 bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Transaction History
        </h3>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
          View All
        </button>
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet2 className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-400 text-lg mb-2">No transactions yet</p>
          <p className="text-gray-500 text-sm">Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white/5 rounded-2xl p-4 border border-gray-600/20 hover:border-gray-500/40 transition-all duration-300 hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === "deposit"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {getTransactionIcon(transaction.type, transaction.amount)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {getTransactionTitle(transaction)}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {getTimeAgo(transaction.timestamp)}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Balance: ₹{formatCurrency(transaction.balance_after)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-lg ${
                      transaction.type === "deposit" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {transaction.type === "deposit" ? "+" : "-"}₹{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-gray-400 text-sm capitalize">
                    {transaction.type}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {transactions.length > 5 && (
            <div className="text-center pt-4">
              <button className="text-purple-400 hover:text-purple-300 transition-colors duration-300">
                Show {transactions.length - 5} more transactions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

 export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

const Wallet: React.FC<WalletProps> = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { user: profile, getProfile } = useAuthStore();
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const userId = user?.id;

  // Fetch user and transaction data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch transactions
      const transactionsData = await transactionAPI.getUserTransactions(
        userId ?? ""
      );
      setTransactions(transactionsData);
    } catch (err: any) {
      setError(err.message || "Failed to load wallet data");
      console.error("Error fetching wallet data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (userId) {
      getProfile(userId);
    }
  }, [userId]);

  // Format currency


  
  return (
    <div className="min-h-screen p-3">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="mb-8 bg-black/30 backdrop-blur-xl rounded-md p-4 border border-gray-700/30">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center justify-start w-full gap-6 mb-6 md:mb-0">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl font-semibold shadow-2xl animate-pulse">
                  🎮
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-black flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                 {profile?.username}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-xs font-semibold">
                      Diamond
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-purple-400 fill-current" />
                    <span className="text-purple-400 text-xs">Level 47</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <div className="bg-green-500/20 px-4 py-2 rounded-md border border-green-500/30">
                    <span className="text-green-400 font-semibold">
                      ● Online
                    </span>
                  </div>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-md hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg">
                    <Bell className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Balance Card */}
        <div className="mb-8">
          <div className="hidden md:block bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Wallet2 className="w-8 h-8 text-cyan-400" />
                  <p className="text-gray-300 text-lg">Total Balance</p>
                </div>
                <div className="flex items-end gap-3">
                  <h2 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    ₹{profile ? formatCurrency(profile.wallet) : "0.00"}
                  </h2>
                  <div className="flex items-center bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-green-400 font-semibold">+2.4%</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDepositModalOpen(true)}
                  className="group flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold px-8 py-4 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105"
                >
                  <ArrowDownToLine
                    size={20}
                    className="group-hover:animate-bounce"
                  />
                  <span>Deposit</span>
                </button>
                <button 
                  disabled={!profile || profile.wallet <= 0}  
                  onClick={() => setIsWithdrawalModalOpen(true)}
                  className="group flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUpFromLine
                    size={20}
                    className="group-hover:animate-bounce"
                  />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Balance Card */}
          <div className="md:hidden">
            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 rounded-md p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 animate-pulse delay-1000"></div>

              <div className="flex items-center mb-4">
                <Sparkles className="text-white mr-2 animate-spin" size={24} />
                <p className="text-white font-semibold sm:font-bold text-lg">
                  Gaming Wallet
                </p>
              </div>

              <div className="bg-black/30 backdrop-blur-lg p-4 rounded-md mb-6 border border-white/20">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  ₹{profile ? formatCurrency(profile.wallet) : "0.00"}
                </h2>
                <div className="flex items-center">
                  <div className="flex items-center bg-green-500/30 px-3 py-1 rounded-full">
                    <TrendingUp className="text-green-300 mr-1" size={16} />
                    <span className="text-green-300 text-sm">
                      +2.4% this week
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsDepositModalOpen(true)} 
                  className="group cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 flex flex-col items-center justify-center p-4 rounded-md hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:scale-105"
                >
                  <ArrowDownToLine
                    className="text-white mb-2 group-hover:animate-bounce"
                    size={24}
                  />
                  <span className="text-white font-semibold">Deposit</span>
                </button>
                <button 
                  disabled={!profile || profile.wallet <= 0}  
                  onClick={() => setIsWithdrawalModalOpen(true)} 
                  className="group cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 flex flex-col items-center justify-center p-4 rounded-md hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUpFromLine
                    className="text-white mb-2 group-hover:animate-bounce"
                    size={24}
                  />
                  <span className="text-white font-semibold">Withdraw</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {gameStats.map((stat, index) => (
            <div
              key={index}
              className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                <div
                  className={`w-2 h-2 ${stat.color.replace(
                    "text-",
                    "bg-"
                  )} rounded-full animate-pulse`}
                ></div>
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group relative transform transition-all duration-700 hover:scale-110"
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div
                className={`
                relative w-full h-48 transition-all duration-700 cursor-pointer
                ${activeCard === index ? "scale-105 -translate-y-4" : ""}
              `}
              >
                <div
                  className={`
                  absolute inset-0 rounded-3xl blur-xl opacity-30 transition-opacity duration-700
                  ${card.bgColor}
                  ${activeCard === index ? "opacity-60 animate-pulse" : ""}
                `}
                ></div>

                <div className="relative h-full bg-black/40 backdrop-blur-xl rounded-3xl p-6 flex flex-col items-center justify-center border border-gray-700/30 hover:border-gray-600/50 transition-all duration-500">
                  {activeCard === index && (
                    <>
                      <div className="absolute top-2 left-2 w-6 h-6">
                        <div
                          className={`absolute top-0 left-0 w-full h-0.5 ${card.color.replace(
                            "text-",
                            "bg-"
                          )} animate-pulse`}
                        ></div>
                        <div
                          className={`absolute top-0 left-0 h-full w-0.5 ${card.color.replace(
                            "text-",
                            "bg-"
                          )} animate-pulse`}
                        ></div>
                      </div>
                      <div className="absolute top-2 right-2 w-6 h-6">
                        <div
                          className={`absolute top-0 right-0 w-full h-0.5 ${card.color.replace(
                            "text-",
                            "bg-"
                          )} animate-pulse`}
                        ></div>
                        <div
                          className={`absolute top-0 right-0 h-full w-0.5 ${card.color.replace(
                            "text-",
                            "bg-"
                          )} animate-pulse`}
                        ></div>
                      </div>
                      <div className="absolute bottom-2 left-2 w-6 h-6">
                        <div
                          className={`absolute bottom-0 left-0 w-full h-0.5 ${card.color.replace(
                            "text-",
                            "bg-"
                          )} animate-pulse`}
                        ></div>
                        <div
                          className={`absolute bottom-0 left-0 h-full w-0.5 ${card.color.replace(
                            "text-",
                            "bg-"
                          )} animate-pulse`}
                        ></div>
                      </div>
                      <div className="absolute bottom-2 right-2 w-6 h-6">
                        <div
                          className={`absolute bottom-0 right-0 w-full h-0.5 ${card.color.replace(
                            "text-",
                            "bg-"
                          )} animate-pulse`}
                        ></div>
                        <div
                          className={`absolute bottom-0 right-0 h-full w-0.5 ${card.color.replace(
                            "text-",
                            "bg-"
                          )} animate-pulse`}
                        ></div>
                      </div>
                    </>
                  )}

                  <div
                    className={`
                    relative mb-4 w-20 h-20 flex items-center justify-center rounded-full
                    transition-all duration-500 group-hover:scale-110
                    ${activeCard === index ? card.glow : ""}
                  `}
                  >
                    <card.icon
                      size={40}
                      className={`
                        ${card.color} transition-all duration-500
                        ${
                          activeCard === index
                            ? "drop-shadow-2xl animate-pulse"
                            : ""
                        }
                      `}
                    />
                    {activeCard === index && (
                      <div
                        className={`absolute inset-0 rounded-full ${card.bgColor} blur-2xl opacity-30 animate-pulse`}
                      ></div>
                    )}
                  </div>

                  <h3
                    className={`
                    font-bold text-xl mb-2 transition-all duration-300 text-center
                    ${activeCard === index ? card.color : "text-white"}
                  `}
                  >
                    {card.label}
                  </h3>

                  <p className="text-gray-400 text-sm text-center mb-4">
                    {card.description}
                  </p>

                  {activeCard === index && (
                    <button
                      className={`
                      absolute -bottom-4 transform translate-y-0 opacity-100 transition-all duration-500
                      px-6 py-2 rounded-full font-bold text-sm
                      ${card.bgColor} text-white shadow-lg hover:shadow-xl hover:scale-105
                      border border-white/20
                    `}
                    >
                      Access Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Updated Game History Component with actual transaction data */}
        <UserGameHistory 
          transactions={transactions} 
          formatCurrency={formatCurrency}
        />

        {/* Transaction Modals */}
        <DepositModal
          isOpen={isDepositModalOpen}
          closeModal={() => setIsDepositModalOpen(false)}
          userId={profile?.id ?? ""}
          onSuccess={fetchData}
          currentBalance={profile?.wallet || 0}
        />

        <WithdrawalModal
          isOpen={isWithdrawalModalOpen}
          closeModal={() => setIsWithdrawalModalOpen(false)}
          userId={profile?.id ?? ""}
          onSuccess={fetchData}
          currentBalance={profile?.wallet || 0}
        />
      </div>
    </div>
  );
};

export default Wallet;