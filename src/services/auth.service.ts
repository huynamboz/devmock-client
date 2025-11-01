import { apiClient } from "@/lib/api-client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth";

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
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!apiClient.getAccessToken();
  }
}

export const authService = new AuthService();

