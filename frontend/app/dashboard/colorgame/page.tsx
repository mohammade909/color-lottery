"use client";
import ColorGame from "@/components/ColorGame";

export default function page() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full ">
        <ColorGame />
      </div>
    </div>
  );
}
