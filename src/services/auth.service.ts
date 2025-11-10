import type {
  AuthResponse,
  ChangePasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth";

import { apiClient } from "@/lib/api-client";

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);

    return response.data;
  }

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);

    return response.data;
  }

  /**
   * Login with Google OAuth
   */
  async googleLogin(data: GoogleLoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/google", data);

    return response.data;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me");

    return response.data;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  }

  /**
   * Change password (only for LOCAL accounts)
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post("/auth/change-password", data);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!apiClient.getAccessToken();
  }
}

export const authService = new AuthService();
