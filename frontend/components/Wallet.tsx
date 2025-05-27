import React, { useState, useEffect } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import DepositModal from "./DepositModal";
import WithdrawalModal from "./WithdrawalModal";
import { api, transactionAPI } from "../lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

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

interface User {
  id: string;
  username: string;
  email: string;
  wallet: number;
}

const Wallet: React.FC<WalletProps> = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { user: profile, getProfile } = useAuthStore();

  const userId = user?.id;
  // Fetch user and transaction data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch user data
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
  }, [userId]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

 
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 p-4 bg-red-50 rounded-md">{error}</div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Your Wallet
            </h2>
            <div className="text-3xl font-bold text-indigo-600">
              {profile ? formatCurrency(profile.wallet) : "$0.00"}
            </div>
          </div>

          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <ArrowDownIcon className="h-5 w-5 mr-2" />
              Deposit
            </button>
            <button
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              disabled={!profile || profile.wallet <= 0}
            >
              <ArrowUpIcon className="h-5 w-5 mr-2" />
              Withdraw
            </button>
          </div>

          <div>
            <h3 className="font-medium text-gray-800 mb-4">
              Recent Transactions
            </h3>
            {transactions.length === 0 ? (
              <p className="text-gray-500 italic">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center border-b pb-3"
                  >
                    <div>
                      <p className="font-medium">
                        {tx.type === "deposit" ? "Deposit" : "Withdrawal"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                      {tx.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {tx.description}
                        </p>
                      )}
                    </div>
                    <div
                      className={`font-semibold ${
                        tx.type === "deposit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.type === "deposit" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}

                {transactions.length > 5 && (
                  <div className="text-center mt-4">
                    <a
                      href="#"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      View All Transactions
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

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
        </>
      )}
    </div>
  );
};

export default Wallet;
