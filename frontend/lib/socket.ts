import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io('http://localhost:8800', {
    auth: {
      token: `Bearer ${token}`,
    },
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};






















// import React from "react";
// import { io, Socket } from "socket.io-client";
// import { create } from "zustand";
// import { ColorGame, GameResult, UserBet } from "../types";

// let socket: Socket | null = null;

// // Socket connection status
// export enum ConnectionStatus {
//   DISCONNECTED = "disconnected",
//   CONNECTING = "connecting",
//   CONNECTED = "connected",
// }

// // Socket store interface
// interface SocketState {
//   socket: Socket | null;
//   status: ConnectionStatus;
//   activeGames: ColorGame[];
//   currentResults: Record<string, GameResult>; // Mapped by period_id
//   userBets: UserBet[];
//   recentResults: GameResult[];

//   // Connection methods
//   connect: () => void;
//   disconnect: () => void;

//   // Game actions
//   placeBet: (bet: PlaceBetRequest) => Promise<UserBet | null>;

//   // Internal state updaters
//   setStatus: (status: ConnectionStatus) => void;
//   setActiveGames: (games: ColorGame[]) => void;
//   addOrUpdateGame: (game: ColorGame) => void;
//   removeGame: (gameId: string) => void;
//   setGameResult: (gameId: string, result: GameResult) => void;
//   addUserBet: (bet: UserBet) => void;
//   setUserBets: (bets: UserBet[]) => void;
//   setRecentResults: (results: GameResult[]) => void;
// }

// // Request types
// export interface PlaceBetRequest {
//   user_id: string;
//   period_id: string;
//   bet_type: string;
//   bet_value: string;
//   amount: number;
// }

// export const useSocketStore = create<SocketState>((set, get) => ({
//   socket: null,
//   status: ConnectionStatus.DISCONNECTED,
//   activeGames: [],
//   currentResults: {},
//   userBets: [],
//   recentResults: [],

//   connect: () => {
//     if (socket) return; // Already have a socket

//     set({ status: ConnectionStatus.CONNECTING });

//     // Create socket connection - adjust URL to match your backend
//     socket = io("http://localhost:8800", {
//       transports: ["websocket"],
//       autoConnect: true,
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });

//     // Update the socket in the store
//     set({ socket });

//     // Socket event handlers
//     socket.on("connect", () => {
//       console.log("Socket connected!");
//       set({ status: ConnectionStatus.CONNECTED });

//       // Request initial data
//       if (socket) {
//         socket.emit("getActiveGames");
//         socket.emit("getRecentResults");
//       }

//       // If we have a user ID, get their bets
//       if (typeof window !== "undefined") {
//         const userId = localStorage.getItem("userId");
//         if (userId && socket) {
//           socket.emit("getUserBets", { userId });
//         }
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("Socket disconnected");
//       set({ status: ConnectionStatus.DISCONNECTED });
//     });

//     socket.on("error", (error) => {
//       console.error("Socket error:", error);
//     });

//     // Game-related event handlers
//     socket.on("activeGames", (games: ColorGame[]) => {
//       set({ activeGames: games });
//     });

//     socket.on("newGame", (game: ColorGame) => {
//       get().addOrUpdateGame(game);
//     });

//     socket.on("gameResult", (data: { gameId: string; result: GameResult }) => {
//       const { gameId, result } = data;
//       get().setGameResult(gameId, result);

//       if (socket) {
//         socket.emit("getActiveGames");
//         socket.emit("getRecentResults");
//       }
//       // When we get a result, also update active games and recent results
//     });

//     socket.on("userBets", (bets: UserBet[]) => {
//       set({ userBets: bets });
//     });

//     socket.on("betPlaced", (bet: UserBet) => {
//       get().addUserBet(bet);
//     });

//     socket.on("recentResults", (results: GameResult[]) => {
//       console.log(results)
//       set({ recentResults: results });
//     });
//   },

//   disconnect: () => {
//     if (socket) {
//       socket.disconnect();
//       socket = null;
//       set({ socket: null, status: ConnectionStatus.DISCONNECTED });
//     }
//   },

//   placeBet: async (betRequest: PlaceBetRequest): Promise<UserBet | null> => {
//     return new Promise((resolve, reject) => {
//       if (!socket || socket.disconnected) {
//         reject(new Error("Socket not connected"));
//         return;
//       }

//       socket
//         .timeout(5000)
//         .emit("placeBet", betRequest, (err: any, response: UserBet) => {
//           if (err) {
//             console.error("Error placing bet:", err);
//             reject(err);
//             return;
//           }

//           get().addUserBet(response);
//           resolve(response);
//         });
//     });
//   },

//   // State updaters
//   setStatus: (status: ConnectionStatus) => set({ status }),

//   setActiveGames: (games: ColorGame[]) => set({ activeGames: games }),

//   addOrUpdateGame: (game: ColorGame) =>
//     set((state) => {
//       const existingGameIndex = state.activeGames.findIndex(
//         (g) => g.id === game.id
//       );

//       if (existingGameIndex >= 0) {
//         // Update existing game
//         const updatedGames = [...state.activeGames];
//         updatedGames[existingGameIndex] = game;
//         return { activeGames: updatedGames };
//       } else {
//         // Add new game
//         return { activeGames: [...state.activeGames, game] };
//       }
//     }),

//   removeGame: (gameId: string) =>
//     set((state) => ({
//       activeGames: state.activeGames.filter((game) => game.id !== gameId),
//     })),

//   setGameResult: (gameId: string, result: GameResult) =>
//     set((state) => ({
//       currentResults: {
//         ...state.currentResults,
//         [gameId]: result,
//       },
//     })),

//   addUserBet: (bet: UserBet) =>
//     set((state) => ({
//       userBets: [bet, ...state.userBets],
//     })),

//   setUserBets: (bets: UserBet[]) => set({ userBets: bets }),

//   setRecentResults: (results: GameResult[]) => set({ recentResults: results }),
// }));

// // Hook to ensure socket connection in components
// export function useSocketConnection() {
//   const { status, connect } = useSocketStore();

//   React.useEffect(() => {
//     if (status === ConnectionStatus.DISCONNECTED) {
//       connect();
//     }

//     // Cleanup on unmount
//     return () => {
//       // Don't disconnect here as other components might need the connection
//       // We'll handle disconnection elsewhere when appropriate
//     };
//   }, [status, connect]);

//   return status;
// }
