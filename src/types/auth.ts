export type UserRole = "USER" | "ADMIN";
export type Provider = "LOCAL" | "GOOGLE";

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  provider: Provider;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

