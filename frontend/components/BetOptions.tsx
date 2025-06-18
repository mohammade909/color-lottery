
"use client";
import React from "react";
import useColorGameStore, {
  BetType,
  ColorValue,
  SizeValue,
} from "@/store/useColorGameStore";

const BetOptions: React.FC = () => {
  const { selectedBetType, selectedBetValue, selectBetType, selectBetValue } =
    useColorGameStore();
  const handleBetSelection = (type: BetType, value: string) => {
    selectBetType(type);
    selectBetValue(value);
  };

  const colorOptions = [
    { value: ColorValue.GREEN, label: "Green", class: "bg-green-500" },
    { value: ColorValue.BLACK, label: "Violet", class: "bg-purple-500" }, // Changed BLACK to Violet to match screenshot
    { value: ColorValue.RED, label: "Red", class: "bg-red-500" },
  ];

  const numberOptions = [
    { img: "/ball0.png", label: "0", colors: ["red", "violet"] },
    { img: "/ball1.png", label: "1", colors: ["green"] },
    { img: "/ball2.png", label: "2", colors: ["red"] },
    { img: "/ball3.png", label: "3", colors: ["green"] },
    { img: "/ball4.png", label: "4", colors: ["red"] },
    { img: "/ball5.png", label: "5", colors: ["green", "violet"] },
    { img: "/ball6.png", label: "6", colors: ["red"] },
    { img: "/ball7.png", label: "7", colors: ["green"] },
    { img: "/ball8.png", label: "8", colors: ["red"] },
    { img: "/ball9.png", label: "9", colors: ["green"] },
  ];

  const multiplierOptions = [
    { value: "random", label: "Random", isSpecial: true },
    { value: "x1", label: "X1" },
    { value: "x5", label: "X5" },
    { value: "x10", label: "X10" },
    { value: "x20", label: "X20" },
    { value: "x50", label: "X50" },
    { value: "x100", label: "X100" },
  ];

  // const sizeOptions = [
  //   { value: SizeValue.BIG, label: "Big", baseColor: "orange" },
  //   { value: SizeValue.SMALL, label: "Small", baseColor: "blue" },
  // ];
  const sizeOptions = [
    {
      value: SizeValue.BIG,
      label: "Big",
      baseClass: "bg-orange-500",
      selectedClass: "bg-orange-700",
    },
    {
      value: SizeValue.SMALL,
      label: "Small",
      baseClass: "bg-blue-500",
      selectedClass: "bg-blue-700",
    },
  ];

  const getNumberBg = (colors: string[]) => {
    if (colors.includes("red") && colors.includes("violet")) {
      return "bg-gradient-to-r from-red-500 to-purple-500";
    } else if (colors.includes("green") && colors.includes("violet")) {
      return "bg-gradient-to-r from-green-500 to-purple-500";
    } else if (colors.includes("red")) {
      return "bg-red-500";
    } else if (colors.includes("green")) {
      return "bg-green-500";
    }
    return "bg-gray-500";
  };

  return (
    <div className="">
      <div className="max-w-full">
        {/* Color Selection */}
        <div className="flex gap-2 mb-6">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => handleBetSelection(BetType.COLOR, color.value)}
              className={`flex-1 text-sm py-3 px-4 rounded-[0px_32px_0px_30px]  text-white transition-all ${
                color.class
              } ${
                selectedBetType === BetType.COLOR &&
                selectedBetValue === color.value
                  ? "shadow-sm"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              {color.label}
            </button>
          ))}
        </div>

        {/* Number Grid */}
        {/* <div className="grid grid-cols-5 gap-3 mb-6">
          {numberOptions.map((number) => (
            <button
              key={number.img}
              onClick={() => handleBetSelection(BetType.NUMBER, number.img)}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg
                ${getNumberBg(number.colors)}
                ${
                  selectedBetType === BetType.NUMBER &&
                  selectedBetValue === number.img
                    ? "ring-4 ring-yellow-400 shadow-lg transform scale-110"
                    : "hover:scale-105 shadow-md"
                }
                transition-all duration-200 relative
              `}
            >
              {number.label}
              {selectedBetType === BetType.NUMBER &&
                selectedBetValue === number.img && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  </div>
                )}
            </button>
          ))}
        </div> */}

        <div className="grid sm:grid-cols-8 grid-cols-5  gap-2 bg-gray-900/50 rounded-2xl border-white/20 border border-dashed p-3 mb-6">
          {numberOptions.map((num) => {
            const isSelected =
              selectedBetType === BetType.NUMBER &&
              selectedBetValue === num.label;

            return (
              <button
                key={num.label}
                onClick={() => handleBetSelection(BetType.NUMBER, num.label)}
                className={`
           rounded-full transition-all flex items-center justify-center
          ${
            isSelected
              ? "bg-gray-700 border-[0.5px] border-red-200 "
              : ""
          }
        `}
              >
                {num.img && (
                  <img src={num.img} alt={num.label} className="w-12" />
                )}
              </button>
            );
          })}
        </div>

        {/* Multipliers */}
        {/* <div className="grid grid-cols-4 gap-2 mb-6">
          {multiplierOptions.map((mult) => (
            <button
              key={mult.value}
              onClick={() => handleBetSelection(BetType.NUMBER, mult.value)} // You might want to create a separate BetType for multipliers
              className={`
                py-2 px-3 rounded-lg font-semibold text-sm transition-all
                ${
                  mult.isSpecial
                    ? selectedBetValue === mult.value
                      ? "bg-red-500 text-white ring-2 ring-red-300"
                      : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                    : selectedBetValue === mult.value
                    ? "bg-gray-600 text-white ring-2 ring-gray-400"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }
              `}
            >
              {mult.label}
            </button>
          ))}
        </div> */}

        <div className="flex rounded-full overflow-hidden shadow-lg">
          {sizeOptions.map((size) => {
            const isSelected =
              selectedBetType === BetType.SIZE &&
              selectedBetValue === size.value;

            return (
              <button
                key={size.value}
                onClick={() => handleBetSelection(BetType.SIZE, size.value)}
                className={`
          flex-1 p-2  text-sm transition-all text-white
          ${isSelected ? size.selectedClass : size.baseClass}
          ${isSelected ? "shadow-inner" : "opacity-90 hover:opacity-100"}
        `}
              >
                {size.label}
              </button>
            );
          })}
        </div>

        {/* Selection Summary */}
        {/* <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <div className="text-white text-sm space-y-2">
            <div>Selected Type: <span className="font-semibold">{selectedBetType || 'None'}</span></div>
            <div>Selected Value: <span className="font-semibold">{selectedBetValue || 'None'}</span></div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default BetOptions;
