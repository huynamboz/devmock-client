export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  timeout: 30000, // 30 seconds
} as const;

// Storage keys
export const STORAGE_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
} as const;

