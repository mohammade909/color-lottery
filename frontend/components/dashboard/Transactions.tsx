import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, Filter, Calendar } from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal';
  amount: string;
  timestamp: string;
  description: string;
  status: 'pending' | 'complete';
}

const TransactionDashboard: React.FC = () => {
  const transactionData: Transaction[] = [
    {
      "id": "07644f04-1cfb-4332-a967-f35f542ad04c",
      "user_id": "ed267f72-49ce-4d80-adf1-30daf26b13e7",
      "type": "withdrawal",
      "amount": "30.00",
      "timestamp": "2025-05-19T12:20:02.528Z",
      "description": "Withdrawal on 5/19/2025",
      "status": "pending"
    },
    {
      "id": "1a889245-bdd5-4795-b681-12d445d53170",
      "user_id": "ed267f72-49ce-4d80-adf1-30daf26b13e7",
      "type": "deposit",
      "amount": "100.00",
      "timestamp": "2025-05-22T04:35:02.937Z",
      "description": "Deposit on 5/22/2025",
      "status": "complete"
    },
    {
      "id": "5c56b473-b4d1-4d67-b9a3-de589df24496",
      "user_id": "ddce8188-bbfc-487a-8e35-2ae7b6d9cf87",
      "type": "withdrawal",
      "amount": "10.00",
      "timestamp": "2025-05-23T10:22:35.497Z",
      "description": "Withdrawal on 5/23/2025",
      "status": "pending"
    },
    {
      "id": "75aa3721-496b-4cf8-8d41-d5aaa6703812",
      "user_id": "ddce8188-bbfc-487a-8e35-2ae7b6d9cf87",
      "type": "deposit",
      "amount": "899.00",
      "timestamp": "2025-05-22T09:09:53.484Z",
      "description": "Deposit on 5/22/2025",
      "status": "complete"
    }
  ];

  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'complete'>('all');

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const filteredTransactions = transactionData.filter(transaction => {
    const typeMatch = filterType === 'all' || transaction.type === filterType;
    const statusMatch = filterStatus === 'all' || transaction.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const totalDeposits = transactionData
    .filter(t => t.type === 'deposit' && t.status === 'complete')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalWithdrawals = transactionData
    .filter(t => t.type === 'withdrawal' && t.status === 'complete')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const pendingCount = transactionData.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Transaction Dashboard
          </h1>
          <p className="text-gray-600">Manage and monitor your financial transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Deposits</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(totalDeposits.toString())}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ArrowUpCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Withdrawals</p>
                <p className="text-2xl font-bold text-red-600">{formatAmount(totalWithdrawals.toString())}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ArrowDownCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Transactions</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setFilterType('deposit')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'deposit'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Deposits
              </button>
              <button
                onClick={() => setFilterType('withdrawal')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'withdrawal'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Withdrawals
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('complete')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'complete'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Complete
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Transactions ({filteredTransactions.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      transaction.type === 'deposit' 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      {transaction.type === 'deposit' ? (
                        <ArrowUpCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {transaction.type}
                      </h3>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {formatDate(transaction.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      transaction.type === 'deposit' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}{formatAmount(transaction.amount)}
                    </p>
                    
                    <div className="flex items-center justify-end gap-2 mt-1">
                      {transaction.status === 'complete' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={`text-sm font-medium capitalize ${
                        transaction.status === 'complete' 
                          ? 'text-green-600' 
                          : 'text-amber-600'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDashboard;