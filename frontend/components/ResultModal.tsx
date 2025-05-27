'use client';

import { useState, useEffect, ReactNode } from 'react';
import { X, Trophy, Frown } from 'lucide-react';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'win' | 'lose';
  message?: string;
  score?: number;
  onPlayAgain?: () => void;
}

export const ResultModal = ({
  isOpen,
  onClose,
  type,
  message,
  score,
  onPlayAgain
}: ResultModalProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      document.body.style.overflow = 'auto';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getDefaultMessage = () => {
    return type === 'win' 
      ? 'Congratulations! You won the game!' 
      : 'Game over! Better luck next time!';
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`transform overflow-hidden rounded-xl shadow-2xl transition-all duration-300 ${
          isOpen ? 'scale-100' : 'scale-95'
        } ${
          type === 'win' 
            ? 'bg-gradient-to-br from-emerald-500 to-green-700' 
            : 'bg-gradient-to-br from-rose-500 to-red-700'
        } w-full max-w-md`}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-xl font-bold text-white">
            {type === 'win' ? 'Victory!' : 'Defeat!'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal content */}
        <div className="px-6 py-4 bg-white rounded-b-xl">
          <div className="flex flex-col items-center text-center">
            <div className={`
              p-4 rounded-full mb-4
              ${type === 'win' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
            `}>
              {type === 'win' ? <Trophy size={48} /> : <Frown size={48} />}
            </div>
            
            <h4 className="text-2xl font-bold mb-2">
              {type === 'win' ? 'You Win!' : 'You Lose!'}
            </h4>
            
            <p className="text-gray-700 mb-4">
              {message || getDefaultMessage()}
            </p>
            
            {score !== undefined && (
              <div className="bg-gray-100 rounded-full px-4 py-2 mb-4">
                <p className="font-medium">Score: {score}</p>
              </div>
            )}
            
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              
              {onPlayAgain && (
                <button
                  onClick={() => {
                    onPlayAgain();
                    onClose();
                  }}
                  className={`
                    flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors
                    ${type === 'win' 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-rose-600 hover:bg-rose-700'}
                  `}
                >
                  Play Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};