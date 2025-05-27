import React from 'react';
import TransactionModal from './TransactionModal';
import { api } from '../lib/api'; // Your API client

interface DepositModalProps {
  isOpen: boolean;
  closeModal: () => void;
  userId: string;
  onSuccess?: () => void;
  currentBalance?: number;
}

const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  closeModal,
  userId,
  onSuccess,
  currentBalance,
}) => {
  console.log(userId)
  const handleDeposit = async (amount: number, description: string) => {
    try {
      await api.post('/transactions', {
        userId,
        amount,
        type: 'deposit',
        description: description || `Deposit on ${new Date().toLocaleDateString()}`,
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Deposit failed:', error);
      throw new Error('Failed to process your deposit. Please try again.');
    }
  };

  return (
    <TransactionModal
      isOpen={isOpen}
      closeModal={closeModal}
      title="Deposit Funds"
      userId={userId}
      onSubmit={handleDeposit}
      type="deposit"
      currentBalance={currentBalance}
    />
  );
};

export default DepositModal;