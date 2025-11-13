import type { User } from "@/types/auth";

import { create } from "zustand";

import { apiClient } from "@/lib/api-client";
import { authService } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  githubLogin: (accessToken: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isLoading: true,
  isAuthenticated: false,

  // Actions
  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  checkAuth: async () => {
    try {
      if (!apiClient.getAccessToken()) {
        set({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });

        return;
      }

      const userData = await authService.getCurrentUser();

      set({
        user: userData,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      // Token invalid or expired
      apiClient.clearTokens();
      set({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  login: async (email: string, password: string) => {
    const response = await authService.login({ email, password });

    apiClient.setTokens(response.accessToken, response.refreshToken);

    set({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  googleLogin: async (idToken: string) => {
    const response = await authService.googleLogin({ idToken });

    apiClient.setTokens(response.accessToken, response.refreshToken);

    set({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  githubLogin: async (accessToken: string) => {
    const response = await authService.githubLogin({ accessToken });

    apiClient.setTokens(response.accessToken, response.refreshToken);

    set({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  register: async (email: string, password: string, name?: string) => {
    const response = await authService.register({ email, password, name });

    apiClient.setTokens(response.accessToken, response.refreshToken);

    set({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
    });

    // After registration, call /me to verify
    await get().checkAuth();
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Even if logout fails, clear local state
      // eslint-disable-next-line no-console
      console.error("Logout error:", error);
    } finally {
      apiClient.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      window.location.href = "/login";
    }
  },
}));
