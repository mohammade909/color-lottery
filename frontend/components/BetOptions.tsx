'use client'
import React from 'react';
import useColorGameStore, { BetType, ColorValue, SizeValue } from '@/store/useColorGameStore';

const BetOptions: React.FC = () => {
  const {
    selectedBetType,
    selectedBetValue,
    selectBetType,
    selectBetValue
  } = useColorGameStore();
  
  // Define all options with their types and values
  const allBetOptions = [
    {
      type: BetType.COLOR,
      label: 'Color',
      options: [
        { value: ColorValue.RED, label: 'Red', class: 'bg-red-500' },
        { value: ColorValue.GREEN, label: 'Green', class: 'bg-green-500' },
        { value: ColorValue.BLACK, label: 'Black', class: 'bg-black' }
      ]
    },
    {
      type: BetType.NUMBER,
      label: 'Number',
      options: Array.from({ length: 10 }, (_, i) => ({
        value: i.toString(),
        label: i.toString(),
        class: i === 0 ? 'bg-green-500' : i % 2 === 0 ? 'bg-red-500' : 'bg-black'
      }))
    },
    {
      type: BetType.SIZE,
      label: 'Size',
      options: [
        { value: SizeValue.BIG, label: 'Big (5-9)', class: 'bg-blue-500' },
        { value: SizeValue.SMALL, label: 'Small (0-4)', class: 'bg-yellow-500' }
      ]
    }
  ];
  
  // Handler to set both bet type and value at once
  const handleBetSelection = (type: BetType, value: string) => {
    selectBetType(type);
    selectBetValue(value);
  };
  
  return (
    <div className="mt-6">
      {allBetOptions.map((betOptionGroup) => (
        <div key={betOptionGroup.type} className="mb-6">
          <h3 className="text-lg font-medium mb-3">{betOptionGroup.label}</h3>
          
          <div className={`grid ${betOptionGroup.type === BetType.NUMBER ? 'grid-cols-5' : 'grid-cols-3'} gap-2`}>
            {betOptionGroup.options.map(option => (
              <button
                key={`${betOptionGroup.type}-${option.value}`}
                className={`
                  px-4 py-2 rounded-md font-medium text-white
                  ${option.class}
                  ${selectedBetType === betOptionGroup.type && selectedBetValue === option.value 
                    ? 'ring-4 ring-blue-300' 
                    : 'hover:opacity-90'
                  }
                `}
                onClick={() => handleBetSelection(betOptionGroup.type, option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BetOptions;