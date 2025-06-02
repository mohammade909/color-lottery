"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ColorGame from "@/components/ColorGame";
import CoinFlipGame from "@/components/FlipCoin";

export default function Home() {
  const [color, setColor] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // If login query param is set, show login form
    if (searchParams?.get("color") === "true") {
      setColor(true);
    }
  }, [searchParams]);

  useEffect(() => {
    console.log("Redirect useEffect triggered:", { isAuthenticated, user });

    // Only redirect if authenticated and user data is available
    if (isAuthenticated && user) {
      console.log("User is authenticated, role:", user.role);

      if (user.role === "user") {
        console.log("Redirecting to dashboard...");
        router.replace("/dashboard");
      } else if (user.role === "admin") {
        console.log("Redirecting to manager...");
        router.replace("/manager");
      } else {
        console.log("Unknown role:", user.role);
      }
    } else {
      console.log(
        "Not redirecting - isAuthenticated:",
        isAuthenticated,
        "user:",
        user
      );
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to Real-Time App</h1>

      <div className="w-full ">
        <div className="flex mb-6">
          <button
            onClick={() => setColor(true)}
            className={`flex-1 py-2 text-center ${
              color ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            color game
          </button>
          <button
            onClick={() => setColor(false)}
            className={`flex-1 py-2 text-center ${
              !color ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Coin Flip
          </button>
        </div>

        {color ? <ColorGame /> : <CoinFlipGame />}
      </div>
    </div>
  );
}
