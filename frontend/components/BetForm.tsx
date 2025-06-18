"use client";
import React, { useState } from "react";
import useColorGameStore, {
  BetType,
  ColorValue,
  SizeValue,
} from "@/store/useColorGameStore";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const BetFormModal: React.FC = () => {
  const {
    selectedGame,
    selectedBetType,
    selectedBetValue,
    betAmount,
    selectedMultiplier,
    setBetAmount,
    clearBetSelection,
    selectMultiplier,
    placeBet,
    loading,
    error,
    // Add these if they exist in your store
    // clearBetSelection, // Assuming this exists to clear selections
  } = useColorGameStore();
  const { user, isAuthenticated } = useAuth();
  const { user: profile, getProfile } = useAuthStore();

  const [formError, setFormError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Auto-open modal when bet type is selected
  React.useEffect(() => {
    if (selectedBetType && !isOpen) {
      setIsOpen(true);
    }
  }, [selectedBetType, isOpen]);

  // Get multiplier based on selected options
  const getMultiplier = () => {
    if (!selectedBetType || !selectedBetValue) return 0;

    const multipliers: Record<string, Record<string, number>> = {
      [BetType.COLOR]: {
        [ColorValue.RED]: 2,
        [ColorValue.GREEN]: 14,
        [ColorValue.BLACK]: 2,
      },
      [BetType.NUMBER]: {
        "0": 9,
        "1": 9,
        "2": 9,
        "3": 9,
        "4": 9,
        "5": 9,
        "6": 9,
        "7": 9,
        "8": 9,
        "9": 9,
      },
      [BetType.SIZE]: {
        [SizeValue.BIG]: 2,
        [SizeValue.SMALL]: 2,
      },
    };

    return multipliers[selectedBetType][selectedBetValue] || 0;
  };

  const gameMultiplier = getMultiplier();
  const potentialWin = betAmount * gameMultiplier;

  // Multiplier buttons
  const multiplierValues = [1.5, 2, 3, 5, 10];

  // Check if form is valid
  const isFormValid = !loading && selectedBetType && selectedBetValue && betAmount > 0;

  const handleClose = () => {
    setIsOpen(false);
    setFormError(null);
    clearBetSelection();
    // Cear bet selection if the function exists
    // if (clearBetSelection) {
    //   clearBetSelection();
    // }
    // Reset bet amount
    setBetAmount(0);
    // Reset multiplier
    selectMultiplier(1);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedGame) {
      setFormError("No active game selected");
      return;
    }

    if (!selectedBetType || !selectedBetValue) {
      setFormError("Please select a bet type and value");
      return;
    }

    if (betAmount <= 0) {
      setFormError("Please enter a valid bet amount");
      return;
    }

    try {
      await placeBet();
      const userId = user?.id;
      if (userId) {
        getProfile(userId);
      }
      toast.success('Bet Placed Successfully!');
      handleClose();
    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setBetAmount(isNaN(value) ? 0 : value);
  };

  // Apply multiplier to the current bet amount
  const applyMultiplier = (multiplierValue: number) => {
    const baseAmount = betAmount / (selectedMultiplier || 1);
    const newAmount = Math.floor(baseAmount * multiplierValue);
    setBetAmount(newAmount > 0 ? newAmount : betAmount);
    selectMultiplier(multiplierValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg mx-2 sm:mx-4 transform transition-all border border-yellow-500/20">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-t-2xl px-4 sm:px-6 py-3 sm:py-4">
          <h3 className="text-lg sm:text-xl font-bold text-black">Place Your Bet</h3>
          <button
            onClick={handleClose}
            className="absolute right-3 sm:right-4 top-3 sm:top-4 text-black/70 hover:text-black transition-colors p-1"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Bet Amount Input */}
            <div className="space-y-2">
              <label htmlFor="betAmount" className="text-sm font-semibold text-yellow-400">
                Bet Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="betAmount"
                  id="betAmount"
                  min={1}
                  value={betAmount || ""}
                  onChange={handleAmountChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-medium border-2 rounded-xl transition-all duration-200 focus:outline-none bg-gray-800 text-white ${
                    betAmount > 0 
                      ? 'border-yellow-400 focus:border-yellow-300 focus:ring-4 focus:ring-yellow-500/20' 
                      : 'border-gray-600 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20'
                  }`}
                  placeholder="Enter amount"
                />
                {betAmount > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Multiplier Buttons */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-yellow-400">
                Multipliers
              </label>
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {multiplierValues.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      selectedMultiplier === value
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-black shadow-lg transform scale-105"
                        : "bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-gray-600 hover:border-yellow-500 hover:scale-105"
                    } ${betAmount <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => applyMultiplier(value)}
                    disabled={betAmount <= 0}
                  >
                    x{value}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Click a multiplier to multiply your base bet amount
              </p>
            </div>

            {/* Potential Win Display */}
            {selectedBetType && selectedBetValue && (
              <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-500/30 rounded-xl p-3 sm:p-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div>
                    <div className="text-xs font-medium text-yellow-400 uppercase tracking-wide">Bet</div>
                    <div className="text-sm sm:text-lg font-bold text-white">{betAmount}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-yellow-400 uppercase tracking-wide">Multiplier</div>
                    <div className="text-sm sm:text-lg font-bold text-yellow-300">x{gameMultiplier}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-yellow-400 uppercase tracking-wide">Potential Win</div>
                    <div className="text-sm sm:text-lg font-bold text-yellow-400">{potentialWin}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {(error || formError) && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 sm:p-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-300 text-xs sm:text-sm font-medium">{error || formError}</span>
                </div>
              </div>
            )}

            {/* Form Validation Status */}
            {!isFormValid && (
              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-3 sm:p-4">
                <div className="flex items-start">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="text-yellow-300 text-xs sm:text-sm">
                    <div className="font-medium">Complete the form to place your bet:</div>
                    <ul className="mt-1 text-xs space-y-1">
                      {!selectedBetType && <li>• Select a bet type</li>}
                      {!selectedBetValue && <li>• Choose a bet value</li>}
                      {betAmount <= 0 && <li>• Enter a valid bet amount</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-1/3 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500"
              >
                Cancel
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full sm:w-2/3 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 ${
                  isFormValid
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-black shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Bet...
                  </div>
                ) : (
                  "Place Bet"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BetFormModal;