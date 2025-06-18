import { create } from "zustand";
import { colorGameAPI } from "@/lib/api";
import { getSocket } from "@/lib/socket";

export enum GameDuration {
  THIRTY_SECONDS = "30s",
  ONE_MINUTE = "1m",
  THREE_MINUTES = "3m",
  FIVE_MINUTES = "5m",
}

export enum BetType {
  COLOR = "color",
  NUMBER = "number",
  SIZE = "size",
}

export enum ColorValue {
  RED = "red",
  GREEN = "green",
  BLACK = "black",
}

export enum SizeValue {
  BIG = "big",
  SMALL = "small",
}

export interface Game {
  id: string;
  period: string;
  duration: string;
  end_time: string;
  active: boolean;
  total_bets: number;
  total_bet_amount: number;
}

export interface GameDetails {
  id: string;
  total_bet_amount: string;
  total_bets: number;
  timestamp: string;
  period: string;
  duration: string;
  active: boolean;
  end_time: string;
  created_at: string;
}

export interface GameResult {
  id: number;
  period_id: string;
  number: number;
  color: ColorValue;
  size: SizeValue;
  timestamp: string;
  description: string;
  game: GameDetails;
}

export interface UserBet {
  id: string;
  user_id: string;
  period_id: string;
  period: string;
  bet_type: BetType;
  bet_value: string;
  amount: number;
  multiplier: number;
  total_amount: number;
  result?: "win" | "lose";
  win_amount?: number;
  timestamp: string;
}

interface ColorGameState {
  activeGames: Record<string, Game>;
  selectedGame: Game | null;
  gameResults: GameResult[];
  userBets: UserBet[];
  loading: boolean;
  error: string | null;
  refresh: boolean;

  // Selected bet options
  selectedBetType: BetType | null;
  selectedBetValue: string | null;
  betAmount: number;
  selectedMultiplier: number | null;

  // Actions
  fetchActiveGames: () => Promise<void>;
  fetchGameByDuration: (duration: string) => Promise<void>;
  handleRefresh: () => void;
  selectGame: (game: Game) => void;
  selectBetType: (betType: BetType) => void;
  clearBetSelection: () => void;
  selectMultiplier: (multiplier: number) => void;
  selectBetValue: (value: string) => void;
  setBetAmount: (amount: number) => void;
  placeBet: () => Promise<void>;
  fetchGameResults: (duration:string) => Promise<void>;
  fetchUserBets: () => Promise<void>;
  resetBetSelection: () => void;
  setupSocketListeners: () => void;
}

const useColorGameStore = create<ColorGameState>((set, get) => ({
  activeGames: {},
  selectedGame: null,
  gameResults: [],
  userBets: [],
  loading: false,
  error: null,
  refresh: false,

  selectedBetType: null,
  selectedBetValue: null,
  betAmount: 10, // default bet amount
  selectedMultiplier: null,

  fetchActiveGames: async () => {
    try {
      set({ loading: true, error: null });
      const response = await colorGameAPI.getActiveGames();

      // Convert array to record with duration as key for easy access
      const gamesRecord: Record<string, Game> = {};
      response.forEach((game: Game) => {
        gamesRecord[game.duration] = game;
      });

      set({
        activeGames: gamesRecord,
        loading: false,
        // If no game is selected yet and we have games, select the 30s one by default
        selectedGame:
          get().selectedGame ||
          gamesRecord[GameDuration.THIRTY_SECONDS] ||
          null,
      });
    } catch (error) {
      console.error("Failed to fetch active games:", error);
      set({ loading: false, error: "Failed to load active games" });
    }
  },

  fetchGameByDuration: async (duration: string) => {
    try {
      set({ loading: true, error: null });
      const response = await colorGameAPI.getGameByDuration(duration);

      // Add or replace the specific game in activeGames by duration
      set((state) => ({
        activeGames: {
          ...state.activeGames,
          [duration]: response.data, // This will add if not exists, or replace if exists
        },
        // Update selectedGame if it matches the duration we just fetched
        selectedGame:
          state.selectedGame?.duration === duration
            ? response.data
            : state.selectedGame,
        loading: false,
      }));
  
    } catch (error) {
      console.error("Failed to fetch game by duration:", error);
      set({ loading: false, error: "Failed to load game" });
    }
  },

  selectGame: (game: Game) => {
    set({ selectedGame: game });
  },
  handleRefresh: () => {
    set({ refresh: true });
  },
  selectBetType: (betType: BetType) => {
    set({ selectedBetType: betType, selectedBetValue: null });
  },
  clearBetSelection: () => {
    set({ selectedBetType: null, selectedBetValue: null });
  },

  selectBetValue: (value: string) => {
    set({ selectedBetValue: value });
  },

  selectMultiplier: (multiplier: number) => {
    set({ selectedMultiplier: multiplier });
  },

  setBetAmount: (amount: number) => {
    set({ betAmount: amount });
  },

  placeBet: async () => {
    const {
      selectedGame,
      selectedBetType,
      selectedBetValue,
      betAmount,
      selectedMultiplier,
    } = get();
    if (
      !selectedGame ||
      !selectedBetType ||
      !selectedBetValue ||
      betAmount <= 0
    ) {
      set({ error: "Please select all bet options and enter a valid amount" });
      return;
    }

    try {
      set({ loading: true, error: null });

      // Get user ID from local storage
      const userData = JSON.parse(localStorage.getItem("auth-storage") || "{}");
      const userId = userData.state.user.id;

      if (!userId) {
        set({ loading: false, error: "You must be logged in to place a bet" });
        return;
      }

      await colorGameAPI.placeBet({
        user_id: userId,
        period_id: selectedGame.id,
        period: selectedGame.period,
        bet_type: selectedBetType,
        bet_value: selectedBetValue,
        amount: betAmount,
        multiplier: selectedMultiplier || 1, // Send the selected multiplier to the backend
      });

      // await api.post('/color-game/bet',);

      // Refresh user bets after placing a new one
      await get().fetchUserBets();

      set({ loading: false });
      // Reset bet selection after successful bet
      get().resetBetSelection();
    } catch (error: any) {
      console.error("Failed to place bet:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to place bet",
      });
    }
  },

  fetchGameResults: async (duration:string) => {
    try {
      set({ loading: true, error: null });
      const response = await colorGameAPI.getRecentResults(duration);
      set({ gameResults: response, loading: false });
    } catch (error) {
      console.error("Failed to fetch game results:", error);
      set({ loading: false, error: "Failed to load game results" });
    }
  },

  fetchUserBets: async () => {
    try {
      // Get user ID from the same storage key used in placeBet
      const userData = JSON.parse(localStorage.getItem("auth-storage") || "{}");
      const userId = userData?.state?.user?.id;

      // console.log("Fetching user bets with userId:", userId);

      if (!userId) {
        console.warn("No user ID found in local storage");
        set({ userBets: [], loading: false, error: "User not logged in" });
        return;
      }

      set({ loading: true, error: null });

      // console.log("Making API request to get user bets");
      const response = await colorGameAPI.getUserBets();
      // console.log("API Response for user bets:", response);

      // Make sure we're getting an array from the API
      const bets = Array.isArray(response) ? response : [];

      set({ userBets: bets, loading: false });
    } catch (error) {
      console.error("Failed to fetch user bets:", error);
      set({ loading: false, error: "Failed to load your bets" });
    }
  },

  resetBetSelection: () => {
    set({
      selectedBetType: null,
      selectedBetValue: null,
      betAmount: 10,
      selectedMultiplier: null,
    });
  },

  setupSocketListeners: () => {
    const socket = getSocket();
    if (!socket) return;

    // Listen for game updates
    socket.on("game:update", (game: Game) => {
      set((state) => ({
        activeGames: {
          ...state.activeGames,
          [game.duration]: game,
        },
        // If this is the currently selected game, update it
        selectedGame:
          state.selectedGame?.id === game.id ? game : state.selectedGame,
      }));
    });

    // Listen for new game results
    socket.on("game:result", (result: GameResult) => {
      set((state) => ({
        gameResults: [result, ...state.gameResults],
      }));

      // Refresh all active games after a result comes in
      get().fetchActiveGames();
    });

    // Listen for bet result updates
    socket.on("bet:update", (bet: UserBet) => {
      set((state) => ({
        userBets: state.userBets.map((b) => (b.id === bet.id ? bet : b)),
      }));
    });
  },
}));

export default useColorGameStore;
