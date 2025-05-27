import React from 'react';
import TransactionModal from './TransactionModal';
import { api } from '../lib/api'; // Your API client

interface WithdrawalModalProps {
  isOpen: boolean;
  closeModal: () => void;
  userId: string;
  onSuccess?: () => void;
  currentBalance: number;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  closeModal,
  userId,
  onSuccess,
  currentBalance,
}) => {
  const handleWithdrawal = async (amount: number, description: string) => {
    try {
      await api.post('/transactions', {
        userId,
        amount,
        type: 'withdrawal',
        description: description || `Withdrawal on ${new Date().toLocaleDateString()}`,
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Withdrawal failed:', error);
      throw new Error('Failed to process your withdrawal. Please try again.');
    }
  };

  return (
    <TransactionModal
      isOpen={isOpen}
      closeModal={closeModal}
      title="Withdraw Funds"
      userId={userId}
      onSubmit={handleWithdrawal}
      type="withdrawal"
      currentBalance={currentBalance}
    />
  );
};

export default WithdrawalModal;