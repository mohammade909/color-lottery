"use client";

import CoinFlipGame from "@/components/FlipCoin";
export default function page() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full ">
        <CoinFlipGame />
      </div>
    </div>
  );
}
