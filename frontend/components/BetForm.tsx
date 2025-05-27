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
const BetForm: React.FC = () => {
  const {
    selectedGame,
    selectedBetType,
    selectedBetValue,
    betAmount,
    selectedMultiplier,
    setBetAmount,
    selectMultiplier,
    placeBet,
    loading,
    error,
  } = useColorGameStore();
  const { user, isAuthenticated } = useAuth();
  const { user: profile, getProfile } = useAuthStore();

  const [formError, setFormError] = useState<string | null>(null);

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

  // Multiplier buttons (instead of quick amounts)
  const multiplierValues = [1.5, 2, 3, 5, 10];

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

    await placeBet();
    const userId = user?.id; // You'll need to implement this
    if (userId) {
      getProfile(userId);
    }
    toast.success('Bet Placed Successfully!')
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setBetAmount(isNaN(value) ? 0 : value);
  };

  // Apply multiplier to the current bet amount
  const applyMultiplier = (multiplierValue: number) => {
    const baseAmount = betAmount / (selectedMultiplier || 1); // Get the original base amount
    const newAmount = Math.floor(baseAmount * multiplierValue);
    setBetAmount(newAmount > 0 ? newAmount : betAmount);
    selectMultiplier(multiplierValue);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Place Your Bet</h3>

      <form onSubmit={handleSubmit}>
        {/* Bet Amount Input */}
        <div className="mb-4">
          <label
            htmlFor="betAmount"
            className="block text-sm font-medium text-gray-700"
          >
            Bet Amount
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="betAmount"
              id="betAmount"
              min={1}
              value={betAmount || ""}
              onChange={handleAmountChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
            />
          </div>
        </div>

        {/* Multiplier Buttons */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Multipliers
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {multiplierValues.map((value) => (
              <button
                key={value}
                type="button"
                className={`px-3 py-1 rounded text-sm ${
                  selectedMultiplier === value
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => applyMultiplier(value)}
                disabled={betAmount <= 0}
              >
                x{value}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click a multiplier to multiply your base bet amount
          </p>
        </div>

        {/* Potential Win */}
        {selectedBetType && selectedBetValue && (
          <div className="bg-gray-100 p-3 rounded mb-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-gray-600">Bet</div>
                <div className="font-semibold">{betAmount}</div>
              </div>
              <div>
                <div className="text-gray-600">Multiplier</div>
                <div className="font-semibold">x{gameMultiplier}</div>
              </div>
              <div>
                <div className="text-gray-600">Potential Win</div>
                <div className="font-semibold text-green-600">
                  {potentialWin}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {(error || formError) && (
          <div className="text-red-500 text-sm mb-4">{error || formError}</div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            loading || !selectedBetType || !selectedBetValue || betAmount <= 0
          }
          className={`w-full py-3 px-4 rounded-md font-medium text-white ${
            loading || !selectedBetType || !selectedBetValue || betAmount <= 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Placing Bet..." : "Place Bet"}
        </button>
      </form>
    </div>
  );
};

export default BetForm;
