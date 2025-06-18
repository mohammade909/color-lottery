"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ColorGame from "@/components/ColorGame";
import CoinFlipGame from "@/components/FlipCoin";
import { authAPI } from "../../lib/api";
export default function Home() {
  const [color, setColor] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  const getUser = useCallback(async () => {
    try {
      const data = await authAPI.getProfile();
      return data;
    } catch (err: any) {
      if (
        err.response?.status === 401 ||
        err.status === 401 ||
        err.message?.toLowerCase().includes("unauthorized")
      ) {
        localStorage.clear();
        console.log("Unauthorized access detected. localStorage cleared.");
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    getUser().catch((error: any) => {
      console.error("Failed to get user:", error);
      // Handle the error appropriately - maybe redirect to login
    });

    // Fix the logic/comment mismatch
    if (searchParams?.get("color") === "true") {
      setColor(true);
    }
  }, [searchParams, getUser]);

  useEffect(() => {
    // Only redirect if authenticated and user data is available
    if (isAuthenticated && user) {
      if (user.role === "user") {
        router.replace("/dashboard");
      } else if (user.role === "admin") {
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
