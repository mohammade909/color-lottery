"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

import { authAPI } from "../../lib/api";

interface Category {
  id: string;
  title: string;
  img: string;
  bgColor: string;
  icon: string;
}

interface Game {
  title: string;
  img: string;
  description: string;
  bgColor: string;
  href: string;
}
const categories: Category[] = [
  {
    id: "popular",
    title: "Popular",
    img: "/trofi.png",
    bgColor: "from-amber-400 to-orange-500",
    icon: "🏆",
  },
  {
    id: "slots",
    title: "Slots",
    img: "/slots.png",
    bgColor: "from-pink-400 to-rose-600",
    icon: "🎮",
  },

  {
    id: "lottery",
    title: "Lottery",
    img: "/lottery.png",
    bgColor: "from-emerald-400 to-green-600",
    icon: "🎲",
  },
  {
    id: "rummy",
    title: "Rummy",
    img: "/rummy.png",
    bgColor: "from-red-400 to-red-600",
    icon: "🃏",
  },
];

const games: Record<string, Game[]> = {
  popular: [
    {
      title: "Cash Splash",
      img: "/trofi.png",
      description: "Win big with instant prizes",
      bgColor: "from-amber-400 to-orange-500",
      href: "/dashboard/colorgame",
    },
    {
      title: "Lucky Spin",
      img: "/lottery.png",
      description: "Spin the wheel of fortune",
      bgColor: "from-pink-400 to-rose-500",
      href: "/dashboard/coingame",
    },
    {
      title: "Mega Jackpot",
      img: "/rummy.png",
      description: "Million dollar prize pool",
      bgColor: "from-purple-500 to-violet-600",
      href: "/dashboard/colorgame",
    },
    {
      title: "Dragon Treasure",
      img: "/slots.png",
      description: "Find the hidden riches",
      bgColor: "from-red-400 to-red-600",
      href: "/dashboard/colorgame",
    },
  ],
  casino: [
    {
      title: "Royal Roulette",
      img: "/api/placeholder/150/150",
      description: "Classic casino experience",
      bgColor: "from-purple-500 to-indigo-600",
      href: "/dashboard/colorgame",
    },
    {
      title: "Blackjack Pro",
      img: "/api/placeholder/150/150",
      description: "Beat the dealer to win",
      bgColor: "from-indigo-400 to-blue-600",
      href: "/dashboard/colorgame",
    },
    {
      title: "Poker Stars",
      img: "/api/placeholder/150/150",
      description: "Test your poker skills",
      bgColor: "from-blue-400 to-sky-600",
       href: "/dashboard/colorgame",
    },
    {
      title: "Baccarat VIP",
      img: "/api/placeholder/150/150",
      description: "Exclusive high-stakes game",
      bgColor: "from-emerald-400 to-teal-600",
       href: "/dashboard/colorgame",
    },
  ],
  // slots: [
  //   {
  //     title: "Fruit Frenzy",
  //     img: "/api/placeholder/150/150",
  //     description: "Classic fruit machine fun",
  //     bgColor: "from-pink-400 to-rose-600",
  //   },
  //   {
  //     title: "Cosmic Spins",
  //     img: "/api/placeholder/150/150",
  //     description: "Space-themed adventure",
  //     bgColor: "from-violet-400 to-purple-600",
  //   },
  //   {
  //     title: "Egyptian Gold",
  //     img: "/api/placeholder/150/150",
  //     description: "Treasures of the pharaohs",
  //     bgColor: "from-amber-500 to-yellow-600",
  //   },
  //   {
  //     title: "Diamond Rush",
  //     img: "/api/placeholder/150/150",
  //     description: "Sparkle your way to riches",
  //     bgColor: "from-blue-400 to-indigo-600",
  //   },
  // ],
  // sports: [
  //   {
  //     title: "Soccer Legends",
  //     img: "/api/placeholder/150/150",
  //     description: "Bet on your favorite teams",
  //     bgColor: "from-blue-400 to-cyan-600",
  //   },
  //   {
  //     title: "Cricket Fever",
  //     img: "/api/placeholder/150/150",
  //     description: "Live cricket betting",
  //     bgColor: "from-emerald-400 to-green-600",
  //   },
  //   {
  //     title: "Basketball Kings",
  //     img: "/api/placeholder/150/150",
  //     description: "NBA and more",
  //     bgColor: "from-orange-400 to-red-500",
  //   },
  //   {
  //     title: "Tennis Masters",
  //     img: "/api/placeholder/150/150",
  //     description: "Grand Slam action",
  //     bgColor: "from-yellow-400 to-amber-600",
  //   },
  // ],
  // lottery: [
  //   {
  //     title: "Win Go",
  //     img: "/api/placeholder/150/150",
  //     description: "Quick draws every minute",
  //     bgColor: "from-emerald-400 to-green-600",
  //   },
  //   {
  //     title: "K3 Lottery",
  //     img: "/api/placeholder/150/150",
  //     description: "Triple number excitement",
  //     bgColor: "from-teal-400 to-cyan-600",
  //   },
  //   {
  //     title: "Daily Millions",
  //     img: "/api/placeholder/150/150",
  //     description: "Daily jackpot draws",
  //     bgColor: "from-blue-400 to-indigo-600",
  //   },
  //   {
  //     title: "Power Draw",
  //     img: "/api/placeholder/150/150",
  //     description: "Massive weekly prizes",
  //     bgColor: "from-violet-400 to-purple-600",
  //   },
  // ],
  // rummy: [
  //   {
  //     title: "Classic Rummy",
  //     img: "/api/placeholder/150/150",
  //     description: "Traditional card game",
  //     bgColor: "from-red-400 to-red-600",
  //   },
  //   {
  //     title: "Speed Rummy",
  //     img: "/api/placeholder/150/150",
  //     description: "Fast-paced action",
  //     bgColor: "from-orange-400 to-red-500",
  //   },
  //   {
  //     title: "Royal Rummy",
  //     img: "/api/placeholder/150/150",
  //     description: "Premium rummy experience",
  //     bgColor: "from-purple-400 to-indigo-600",
  //   },
  //   {
  //     title: "Cash Rummy",
  //     img: "/api/placeholder/150/150",
  //     description: "Play for real money",
  //     bgColor: "from-emerald-400 to-green-600",
  //   },
  // ],
};

export default function Home() {
  const [color, setColor] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("popular");
  const [animate, setAnimate] = useState(false);

  const handleTabClick = (id: any) => {
    setAnimate(true);
    setTimeout(() => {
      setActiveTab(id);
      setAnimate(false);
    }, 300);
  };
  const getUser = useCallback(async () => {
    try {
      const data = await authAPI.getProfile();
      console.log(data);
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
    <div className="min-h-screen p-4 bg-[#284babde]">
      {/* Header notification */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-3 rounded-lg shadow-lg flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <div className="text-white text-lg">🔊</div>
          <p className="text-white sm:font-medium text-sm ">
            Daman uses bank-level encryption to protect your data and
            transactions
          </p>
        </div>
        <button className="bg-white sm:block hidden text-indigo-600 px-4 py-2 rounded-full sm:text-sm text-xs sm:font-bold shadow-md hover:bg-indigo-50 transition-all">
          Details
        </button>
      </div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-700 p-6 mb-8 shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
        <div className="relative z-10">
          <h1 className="sm:text-3xl text-xl font-semibold sm:font-bold text-white mb-2">
            Welcome to Games
          </h1>
          <p className="text-indigo-100 sm:text-base text-sm mb-4">
            Discover the best gaming experience with amazing rewards!
          </p>
          <button className="bg-white text-indigo-600 px-6 py-2 rounded-full sm:text-base text-sm font-bold shadow-lg hover:bg-indigo-50 transition-all">
            Get ₹500 Bonus
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="sm:text-xl text-lg font-medium sm:font-semibold text-white flex items-center">
            <span className="w-2 h-8 text-white bg-red-600 rounded-full mr-2"></span>
            Game Categories
          </h2>
          <div className="px-3 py-1 bg-indigo-50 rounded-full flex items-center text-indigo-700 font-medium text-sm cursor-pointer hover:bg-indigo-100 transition-colors">
            <span>View All</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleTabClick(category.id)}
              className={`
                relative rounded-xl cursor-pointer overflow-hidden shadow-lg
                transition-all duration-300 h-36
                ${
                  activeTab === category.id
                    ? "ring-2 ring-offset-2 ring-opacity-50 ring-indigo-500 scale-105"
                    : "hover:scale-105"
                }
              `}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 ${category.bgColor}`}
              ></div>
              <div className="absolute inset-0 "></div>
              <div className="absolute top-0 left-0 w-full h-full flex justify-between p-4">
                <div className="text-white text-2xl">
                  <img
                    src={category.img}
                    alt={category.title}
                    width={144}
                    height={144}
                    className="w-36"
                  />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    {category.title}
                  </div>
                  <div className="h-1 w-10 bg-white rounded-full mt-1"></div>
                </div>
              </div>
              <div className="absolute inset-0 opacity-0 hover:opacity-20 bg-white transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>

      {activeTab && (
        <div
          className={`transition-opacity duration-300 ${
            animate ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-2 h-8 bg-indigo-600 rounded-full mr-2"></div>
              <h2 className="sm:text-xl text-lg font-medium sm:font-semibold text-white">
                {categories.find((c) => c.id === activeTab)?.title} Games
              </h2>
            </div>
            <div className="px-3 py-1 bg-indigo-50 rounded-full flex items-center text-indigo-700 font-medium text-sm cursor-pointer hover:bg-indigo-100 transition-colors">
              <span>View All</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {games[activeTab]?.map((game: Game, index: number) => (
              <div
                key={index}
                className={`rounded-xl overflow-hidden shadow-lg bg-gradient-to-br ${game.bgColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="relative p-4">
                  <div className="absolute top-0 right-0 bg-white bg-opacity-20 rounded-full px-2 py-1 m-2 text-xs font-medium text-white">
                    HOT
                  </div>
                  <div className="flex flex-col items-center">
                    <h3 className="text-xl font-bold text-white mb-3">
                      {game.title}
                    </h3>
                    <div className="flex items-center justify-center mb-3">
                      <img
                        src={game.img}
                        alt={game.title}
                        width={160}
                        height={160}
                        className="w-40 rounded-full object-cover"
                      />
                    </div>
                    <p className="text-white text-opacity-90 text-sm text-center mb-4">
                      {game.description}
                    </p>
                    <button
                      onClick={() => router.push(game.href)}
                      className="bg-white text-indigo-600 rounded-full px-6 py-2 font-bold shadow-md hover:bg-opacity-90 transition-colors flex items-center"
                    >
                      PLAY
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dragon promo card */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 opacity-20 rounded-full translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-700 opacity-20 rounded-full -translate-x-1/4 translate-y-1/4"></div>
          <div className="relative z-10 grid grid-cols-12 items-center">
            <div className="col-span-12 md:col-span-3 mb-4 md:mb-0 flex justify-center">
              <img
                src="https://daman.online/assets/png/dragon-9eecda27.png"
                alt="Dragon"
                width={224}
                height={224}
                className="w-56 h-56 object-contain drop-shadow-2xl"
              />
            </div>
            <div className="col-span-12 md:col-span-9">
              <div className="mb-2">
                <h2 className="text-white font-bold text-2xl">
                  Dragon Fortune Assistant
                </h2>
              </div>
              <p className="text-white text-opacity-90 text-lg mb-4">
                Win big with five consecutive winning draws! Special rewards
                await.
              </p>
              <button className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-medium px-8 py-2 rounded-full border-2 border-yellow-300 shadow-md">
                Enter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
