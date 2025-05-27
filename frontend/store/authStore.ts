import { create } from "zustand";
import { User } from "@/types";
import { authAPI } from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
   getProfile: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  loading: false,
  error: null,
  isAuthenticated:
    typeof window !== "undefined" ? !!localStorage.getItem("token") : false,

  login: async (username: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authAPI.login(username, password);
      localStorage.setItem("token", token);
      connectSocket(token);
      set({ user, token, isAuthenticated: true, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to login",
        loading: false,
      });
    }
  },
  getProfile: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const user = await authAPI.getProfile(id);
      console.log(user)
      set({ user, loading: false }); // Update the user in state
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch profile",
        loading: false,
      });
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authAPI.register(username, email, password);
      localStorage.setItem("token", token);
      connectSocket(token);
      set({ user, token, isAuthenticated: true, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to register",
        loading: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
